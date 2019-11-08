import { Client } from "kontist";

import prodConfig from "../config";
import devConfig from "../config.dev";

const { baseAPIUrl, clientId, redirectUri } =
  process.env.NODE_ENV === "production" ? prodConfig : devConfig;

const STATE_KEY = "state";
const VERIFIER_KEY = "verifier";
const CLIENT_SCOPE = "clients";

sessionStorage.setItem(
  STATE_KEY,
  sessionStorage.getItem(STATE_KEY) || (Math.random() + "").substring(2)
);
sessionStorage.setItem(
  VERIFIER_KEY,
  sessionStorage.getItem(VERIFIER_KEY) || (Math.random() + "").substring(2)
);

const kontistClient = new Client({
  baseUrl: baseAPIUrl,
  clientId,
  redirectUri,
  scopes: [CLIENT_SCOPE],
  state: sessionStorage.getItem(STATE_KEY) || "",
  verifier: sessionStorage.getItem(VERIFIER_KEY) || ""
});

type Props = {
  children: Function;
};

const KontistClientProvider = (props: Props) => props.children(kontistClient);

export default KontistClientProvider;
