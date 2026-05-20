const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("wallet integration sends pin to pin setup and withdrawal endpoints", () => {
  const walletThunks = read("redux/wallet/wallet.thunks.ts");
  assert.match(walletThunks, /api\.post<[^>]+>\("\/wallets\/pin"/);
  assert.match(walletThunks, /api\.post<[^>]+>\(\s*"\/wallets\/withdraw"/);
  assert.match(walletThunks, /\.\.\.\(body\.pin \? \{ pin: body\.pin \} : \{\}\)/);
});

test("notifications integration uses native push token and notification inbox endpoints", () => {
  const hook = read("hooks/useRegisterFcmToken.ts");
  const notificationThunks = read("redux/notifications/notifications.thunks.ts");

  assert.match(hook, /getDevicePushTokenAsync/);
  assert.doesNotMatch(hook, /getExpoPushTokenAsync/);
  assert.match(notificationThunks, /"\/notifications\/push-token"/);
  assert.match(notificationThunks, /"\/notifications"/);
  assert.match(notificationThunks, /`\/notifications\/\$\{id\}\/read`/);
  assert.match(notificationThunks, /"\/notifications\/read-all"/);
});

test("logistics integration covers rider, delivery, KYC, company, and offer endpoints", () => {
  const logisticsThunks = read("redux/logistics/logistics.thunks.ts");
  [
    "/logistics/companies",
    "/logistics/riders",
    "/logistics/riders/kyc",
    "/logistics/companies/kyc",
    "/logistics/deliveries",
    "/logistics/orders/${order_id}/offers",
    "/logistics/offers/${offer_id}/counter",
    "/logistics/offers/${offer_id}/${path}",
  ].forEach((endpoint) => {
    assert.ok(logisticsThunks.includes(endpoint), `missing ${endpoint}`);
  });
});
