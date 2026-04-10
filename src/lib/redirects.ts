export function getJoinHostRedirectDestination(
  hostname: string,
  requestUrl: string,
) {
  if (hostname !== "join.tum-ai.com") {
    return null;
  }

  const url = new URL(requestUrl);

  if (url.pathname === "/apply") {
    return null;
  }

  return new URL("/apply", url);
}
