import hubAbi   from "./abi/AttendanceHub.js";
import logAbi   from "./abi/AttendanceLog.js";
import tokenAbi from "./abi/AttendanceToken.js";

/* ====== 배포 주소 입력 ====== */
const LOG_ADDR  = "";   // AttendanceLog
const HUB_ADDR  = "";   // AttendanceHub
const TOKEN_ADDR= "";   // AttendanceToken
/* =========================== */

const adminSpan = document.getElementById("adminAddr");
const userCnt   = document.getElementById("userCnt");
const userBal   = document.getElementById("userBal");

let provider, signer, hub, log, token, admin;

/* 지갑 연결 */
document.getElementById("connectBtn").onclick = async () => {
  if (!window.ethereum) return alert("MetaMask 필요!");
  provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer  = await provider.getSigner();
  admin   = await signer.getAddress();
  adminSpan.textContent = admin;

  hub   = new ethers.Contract(HUB_ADDR,   hubAbi,   signer);
  log   = new ethers.Contract(LOG_ADDR,   logAbi,   signer);
  token = new ethers.Contract(TOKEN_ADDR, tokenAbi, signer);

  alert("지갑 연결 완료");
};

/* 사용자 조회 */
document.getElementById("queryBtn").onclick = async () => {
  if (!hub) return alert("지갑 먼저 연결!");
  const addr = document.getElementById("userAddr").value.trim();
  if (!ethers.isAddress(addr)) return alert("주소 형식 오류");

  const cnt = await log.getAttendanceCount(addr);
  const bal = await token.balanceOf(addr);

  userCnt.textContent = cnt.toString();
  userBal.textContent = ethers.formatEther(bal);
};

/* 파라미터 변경 (옵션) */
document.getElementById("setParamBtn").onclick = async () => {
  if (!hub) return alert("지갑 먼저 연결!");

  const every = Number(document.getElementById("rewardEvery").value);
  const amt   = ethers.parseUnits(
    document.getElementById("rewardAmt").value || "0",
    18
  );

  try {
    if (every) {
      const tx1 = await hub.setRewardEvery(every);
      await tx1.wait();
    }
    if (amt > 0n) {
      const tx2 = await hub.setRewardAmount(amt);
      await tx2.wait();
    }
    alert("변경 완료");
  } catch (e) {
    alert(e.reason || e.message);
  }
};
