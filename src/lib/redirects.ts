export function getJoinHostRedirectDestination(
  hostname: string,
  requestUrl: string,
) {
  if (hostname !== "join.tum-ai.com") {
    return null;
  }

  return new URL("/apply", requestUrl);
}
