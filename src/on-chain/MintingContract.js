// PubKeyHash checked at 27Aug2024
export default `
minting signed

import { tx } from ScriptContext

const OWNER: PubKeyHash = PubKeyHash::new(#84e6f5ca8f28b6401742a20119073c64685cd7d7c11b6504b5274075)

func main(_) -> Bool {
    tx.is_signed_by(OWNER)
}`
