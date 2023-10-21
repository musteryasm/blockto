module blockto_sui::blockto_sui {

    use std::string;
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    struct Content has key, store {
        id: UID,
        cid: string::String,
        address: string::String,
        signature: string::String
    }

    public entry fun create_record(cid: string::String, address: string::String, signature: string::String, ctx: &mut TxContext) {
        let content = Content {
            id: object::new(ctx),
            cid,
            address,
            signature
        };
        transfer::transfer(content, tx_context::sender(ctx));
    }

}
