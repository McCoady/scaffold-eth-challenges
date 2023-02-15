import { Card, Col, Divider, Input, Row } from "antd";
import { useBalance, useContractReader, useBlockNumber } from "eth-hooks";
import { useEventListener } from "eth-hooks/events/useEventListener";
import { useTokenBalance } from "eth-hooks/erc/erc-20/useTokenBalance";
import { BigNumber, ethers } from "ethers";
import React, { useState } from "react";
import Address from "./Address";
import Contract from "./Contract";
import Curve from "./Curve";
import TokenBalance from "./TokenBalance";
import Blockies from "react-blockies";

const contractName = "DEX";
const tokenOneName = "Balloons";
const tokenTwoName = "Rocks";

export default function Dex(props) {
  let display = [];

  const [form, setForm] = useState({});
  const [values, setValues] = useState({});
  const tx = props.tx;

  const writeContracts = props.writeContracts;

  const contractAddress = props.readContracts[contractName].address;
  const tokenOneAddress = props.readContracts[tokenOneName].address;
  const tokenTwoAddress = props.readContracts[tokenTwoName].address;
  const contractBalance = useBalance(props.localProvider, contractAddress);

  const tokenOneBalance = useTokenBalance(props.readContracts[tokenOneName], contractAddress, props.localProvider);
  const tokenTwoBalance = useTokenBalance(props.readContracts[tokenTwoName], contractAddress, props.localProvider);
  const tokenOneBalanceFloat = parseFloat(ethers.utils.formatEther(tokenOneBalance));
  const tokenTwoBalanceFloat = parseFloat(ethers.utils.formatEther(tokenTwoBalance));
  const liquidity = useContractReader(props.readContracts, contractName, "totalLiquidity");

  const rowForm = (title, icon, onClick) => {
    return (
      <Row>
        <Col span={8} style={{ textAlign: "right", opacity: 0.333, paddingRight: 6, fontSize: 24 }}>
          {title}
        </Col>
        <Col span={16}>
          <div style={{ cursor: "pointer", margin: 2 }}>
            <Input
              onChange={e => {
                let newValues = { ...values };
                newValues[title] = e.target.value;
                setValues(newValues);
              }}
              value={values[title]}
              addonAfter={
                <div
                  type="default"
                  onClick={() => {
                    onClick(values[title]);
                    let newValues = { ...values };
                    newValues[title] = "";
                    setValues(newValues);
                  }}
                >
                  {icon}
                </div>
              }
            />
          </div>
        </Col>
      </Row>
    );
  };

  if (props.readContracts && props.readContracts[contractName]) {
    display.push(
      <div>
        <Divider>DEX Transactions have a built in 1% slippage allowance.</Divider>
        {rowForm("balloonsToRocks", "🔏", async value => {
          let tokenValue = ethers.utils.parseEther("" + value);
          console.log("VAL IN ETHER", tokenValue);
          let price = await props.readContracts[contractName].price(tokenValue, tokenOneBalance, tokenTwoBalance);
          let minTokensBack = price.mul(99).div(100);
          console.log("CURRENT PRICE", ethers.utils.formatEther(price));
          console.log("MIN ETH BACK", ethers.utils.formatEther(minTokensBack))

          let allowance = await props.readContracts[tokenOneName].allowance(
            props.address,
            props.readContracts[contractName].address,
          );
          console.log("allowance", allowance);

          let approveTx;
          if (allowance.lt(tokenValue)) {
            approveTx = await tx(
              writeContracts[tokenOneName].approve(props.readContracts[contractName].address, tokenValue, {
                gasLimit: 200000,
              }),
            );
          }

          let swapTx = tx(writeContracts[contractName]["balloonsToRocks"](tokenValue, minTokensBack, { gasLimit: 200000 }));
          if (approveTx) {
            console.log("waiting on approve to finish...");
            let approveTxResult = await approveTx;
            console.log("approveTxResult:", approveTxResult);
          }
          let swapTxResult = await swapTx;
          console.log("swapTxResult:", swapTxResult);
        })}

{rowForm("rocksToBalloons", "🔏", async value => {
          let tokenValue = ethers.utils.parseEther("" + value);
          console.log("VAL IN ETHER", tokenValue);
          let price = await props.readContracts[contractName].price(tokenValue, tokenTwoBalance, tokenOneBalance);
          let minTokensBack = price.mul(99).div(100);
          console.log("CURRENT PRICE", ethers.utils.formatEther(price));
          console.log("MIN ETH BACK", ethers.utils.formatEther(minTokensBack))

          let allowance = await props.readContracts[tokenTwoName].allowance(
            props.address,
            props.readContracts[contractName].address,
          );
          console.log("allowance", allowance);

          let approveTx;
          if (allowance.lt(tokenValue)) {
            approveTx = await tx(
              writeContracts[tokenTwoName].approve(props.readContracts[contractName].address, tokenValue, {
                gasLimit: 200000,
              }),
            );
          }

          let swapTx = tx(writeContracts[contractName]["rocksToBalloons"](tokenValue, minTokensBack, { gasLimit: 200000 }));
          if (approveTx) {
            console.log("waiting on approve to finish...");
            let approveTxResult = await approveTx;
            console.log("approveTxResult:", approveTxResult);
          }
          let swapTxResult = await swapTx;
          console.log("swapTxResult:", swapTxResult);
        })}

        <Divider> Liquidity ({liquidity ? ethers.utils.formatEther(liquidity) : "none"}):</Divider>

        {rowForm("deposit", "📥", async value => {
          let valueInEther = ethers.utils.parseEther("" + value);
          let allowance = await props.readContracts[tokenOneName].allowance(
            props.address,
            props.readContracts[contractName].address,
          );
          console.log("allowance", allowance);
          if (allowance.lt(valueInEther)) {
            await tx(
              writeContracts[tokenOneName].approve(props.readContracts[contractName].address, valueInEther, {
                gasLimit: 200000,
              }),
            );
          }
          await tx(writeContracts[contractName]["deposit"]({ value: valueInEther, gasLimit: 200000 }));
        })}

        {rowForm("withdraw", "📤", async value => {
          let valueInEther = ethers.utils.parseEther("" + value);
          let withdrawTxResult = await tx(writeContracts[contractName]["withdraw"](valueInEther));
          console.log("withdrawTxResult:", withdrawTxResult);
        })}
      </div>,
    );
  }

  return (
    <Row span={24}>
      <Col span={12}>
        <Card
          title={
            <div>
              <Address value={contractAddress} />
              <div style={{ float: "right", fontSize: 24 }}>
                <TokenBalance name={tokenOneName} img={"🎈"} address={contractAddress} contracts={props.readContracts} />
                <TokenBalance name={tokenTwoName} img={"🌑"} address={contractAddress} contracts={props.readContracts} />
              </div>
            </div>
          }
          size="large"
          loading={false}
        >
          {display}
        </Card>
        <Row span={12}>
          <Contract
            name="Balloons"
            signer={props.signer}
            provider={props.localProvider}
            show={["balanceOf", "approve"]}
            address={props.address}
            blockExplorer={props.blockExplorer}
            contractConfig={props.contractConfig}
          />
        </Row>
        <Row span={12}>
          <Contract
            name="Rocks"
            signer={props.signer}
            provider={props.localProvider}
            show={["balanceOf", "approve"]}
            address={props.address}
            blockExplorer={props.blockExplorer}
            contractConfig={props.contractConfig}
          />
        </Row>
      </Col>
      <Col span={12}>
        <div style={{ padding: 20 }}>
          <Curve
            addingBalloons={values && values["balloonsToRocks"] ? values["balloonsToRocks"] : 0}
            addingRocks={values && values["rocksToBalloons"] ? values["rocksToBalloons"] : 0}
            tokenOneReserve={tokenOneBalanceFloat}
            tokenTwoReserve={tokenTwoBalanceFloat}
            width={500}
            height={500}
          />
        </div>
      </Col>
    </Row>
  );
}
