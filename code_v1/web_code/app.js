// app.js  ― 출석 + 보상 DEMO (학생 UI)

/* ── ABI 로드 ────────────────────────────────────────── */
import hubAbi   from "./abi/AttendanceHub.js";
import tokenAbi from "./abi/AttendanceToken.js";
import logAbi   from "./abi/AttendanceLog.js";

/* ── 배포 주소 입력 ──────────────────────────────────── */
const LOG_ADDR  = "";   // AttendanceLog
const HUB_ADDR  = "";   // AttendanceHub
const TOKEN_ADDR= "";   // AttendanceToken

/* ── DOM 요소 ────────────────────────────────────────── */
const addrSpan = document.getElementById("addr");
const cntSpan  = document.getElementById("cnt");
const balSpan  = document.getElementById("bal");
const dateInp  = document.getElementById("date");

/* ── 글로벌 상태 ─────────────────────────────────────── */
let provider, signer, hub, token, logContract, myAddr;

/* ── 지갑 연결 버튼 ──────────────────────────────────── */
document.getElementById("connectBtn").onclick = async () => {
  if (!window.ethereum) return alert("MetaMask 필요!");
  provider = new ethers.BrowserProvider(window.ethereum);

  let accounts = await provider.send("eth_accounts", []);
  if (accounts.length === 0) accounts = await provider.send("eth_requestAccounts", []);

  signer  = await provider.getSigner();
  myAddr  = accounts[0];
  addrSpan.textContent = myAddr;

  hub         = new ethers.Contract(HUB_ADDR,   hubAbi,   signer);
  token       = new ethers.Contract(TOKEN_ADDR, tokenAbi, signer);
  logContract = new ethers.Contract(LOG_ADDR,   logAbi,   signer);

  logContract.on("AttendanceLogged", (user, date, ts) => {
    if (user.toLowerCase() === myAddr.toLowerCase()) refresh();
  });

  refresh();
};

/* ── 출석하기 버튼 ───────────────────────────────────── */
document.getElementById("attendBtn").onclick = async () => {
  if (!hub) return alert("먼저 지갑 연결!");

  const date = dateInp.value.trim();
  if (!/^\d{8}$/.test(date)) return alert("YYYYMMDD 8자리 입력!");

  try {
    const tx = await hub.logAndReward(date);
    await tx.wait();

    /* ★ 트랜잭션 확정 직후 값 찍기 */
    const c1 = await logContract.getAttendanceCount(myAddr);
    const b1 = await token.balanceOf(myAddr);
    console.log("TX CONFIRMED → cnt", c1.toString(), "bal", b1.toString());
    /* -------------------------------------------------- */

    await refresh();
    alert("출석 완료!");
  } catch (e) {
    alert(e.reason || e.message || "트랜잭션 실패");
  }
};

/* ── 화면 갱신 함수 ──────────────────────────────────── */
async function refresh() {
  if (!logContract) return;

  const cnt = await logContract.getAttendanceCount(myAddr);
  const bal = await token.balanceOf(myAddr);

  /* ★ refresh 때마다 현재 값 찍기 */
  console.log("REFRESH        cnt", cnt.toString(), "bal", bal.toString());
  /* --------------------------------------------------- */

  cntSpan.textContent = cnt.toString();
  balSpan.textContent = ethers.formatEther(bal);
}