#!/usr/bin/env node
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const { ethers } = require("ethers");

const HOME = path.join(os.homedir(), ".phn");
const ID_FILE = path.join(HOME, "identity.json");

function ensureHome() { fs.mkdirSync(HOME, { recursive: true }); }
function hash(input) { return ethers.id(input); }
function loadIdentity() { return fs.existsSync(ID_FILE) ? JSON.parse(fs.readFileSync(ID_FILE, "utf8")) : null; }
function saveIdentity(data) { ensureHome(); fs.writeFileSync(ID_FILE, JSON.stringify(data, null, 2)); }
function machineFingerprint() {
  return [os.hostname(), os.platform(), os.arch(), os.cpus()[0]?.model || "unknown-cpu", os.totalmem()].join("|");
}
function cmdInit() {
  const existing = loadIdentity();
  if (existing) return console.log(existing);
  const salt = crypto.randomBytes(16).toString("hex");
  const pcIdentitySource = `${machineFingerprint()}|${salt}`;
  const humanIdSource = `phn-human:${crypto.randomUUID()}`;
  const identity = {
    createdAt: new Date().toISOString(),
    pcIdentityHash: hash(pcIdentitySource),
    peaqHumanId: humanIdSource,
    peaqHumanIdHash: hash(humanIdSource),
    nodeId: hash(`phn-node:${pcIdentitySource}`),
    peaqMachineDid: "",
    operatorWallet: ""
  };
  saveIdentity(identity);
  console.log(identity);
}
function cmdShowIdentity() { console.log(loadIdentity() || "No PHN identity found. Run: phn-node init"); }
function cmdSetOperator(wallet) { const i=loadIdentity(); if(!i) return console.error("Run init first"); i.operatorWallet=wallet; saveIdentity(i); console.log(i); }
function cmdSetDid(did) { const i=loadIdentity(); if(!i) return console.error("Run init first"); i.peaqMachineDid=did; saveIdentity(i); console.log(i); }
function cmdRegistrationPayload() {
  const i=loadIdentity(); if(!i) return console.error("Run init first");
  console.log(JSON.stringify({ nodeId:i.nodeId, pcIdentityHash:i.pcIdentityHash, peaqHumanIdHash:i.peaqHumanIdHash, peaqMachineDid:i.peaqMachineDid, operatorWallet:i.operatorWallet }, null, 2));
}
function cmdDoctor() {
  const i=loadIdentity();
  console.log({
    identityPresent: !!i,
    hasOperatorWallet: !!i?.operatorWallet,
    hasMachineDid: !!i?.peaqMachineDid,
    readyForRegistration: !!(i?.operatorWallet && i?.peaqMachineDid)
  });
}
function help() {
  console.log(`PHN Node CLI
Commands:
  init
  identity
  set-operator <wallet>
  set-did <peaq-did>
  registration-payload
  doctor`);
}
const [cmd,arg]=process.argv.slice(2);
({init:cmdInit,identity:cmdShowIdentity,"set-operator":()=>cmdSetOperator(arg),"set-did":()=>cmdSetDid(arg),"registration-payload":cmdRegistrationPayload,doctor:cmdDoctor}[cmd] || help)();
