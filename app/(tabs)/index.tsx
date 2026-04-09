import { Redirect } from "expo-router";

/** Redirect legacy Home route to the Discover tab. */
export default function HomeIndex() {
  return <Redirect href="/(tabs)/competitions" />;
}
