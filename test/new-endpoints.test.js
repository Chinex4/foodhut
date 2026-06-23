const fs = require("node:fs");
const test = require("node:test");
const assert = require("node:assert/strict");

const root = process.cwd();
const read = (file) => fs.readFileSync(`${root}/${file}`, "utf8");

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

test("checkout forwards rider selection and kitchen order queries include kitchen context", () => {
  const cartThunks = read("redux/cart/cart.thunks.ts");
  const orderThunks = read("redux/orders/orders.thunks.ts");

  assert.match(cartThunks, /rider_id,/);
  assert.match(orderThunks, /as_kitchen:\s*query\?\.as_kitchen/);
});

test("search filters can scope results to meals or kitchens", () => {
  const searchTypes = read("redux/search/search.types.ts");
  const searchThunks = read("redux/search/search.thunks.ts");
  const searchBar = read("components/search/SearchBar.tsx");

  assert.match(searchTypes, /scope\?: "ALL" \| "MEALS" \| "KITCHENS"/);
  assert.match(searchThunks, /scope === "KITCHENS"/);
  assert.match(searchThunks, /scope === "MEALS"/);
  assert.match(searchBar, /filtersActive/);
});

test("support contact number uses current FoodHut support phone", () => {
  const supportTab = read("app/users/(tabs)/support/index.tsx");
  const helpPage = read("app/users/profile/get-help.tsx");

  assert.match(supportTab, /2348086298785/);
  assert.match(supportTab, /08086298785/);
  assert.match(helpPage, /SUPPORT_PHONE = "08086298785"/);
  assert.match(helpPage, /SUPPORT_WHATSAPP = "2348086298785"/);
});

test("vendor meal cards use normalized kitchen meal images", () => {
  const imageComponent = read("components/kitchen/KitchenMealImage.tsx");
  const dashboard = read("app/kitchen/(tabs)/index.tsx");
  const menu = read("app/kitchen/(tabs)/menu/index.tsx");

  assert.match(imageComponent, /getKitchenMealImageUrl/);
  assert.match(imageComponent, /getStorageFileUrl\(coverImageId\)/);
  assert.match(imageComponent, /ENV\.API_BASE_URL/);
  assert.match(dashboard, /<KitchenMealImage/);
  assert.match(menu, /<KitchenMealImage/);
});
