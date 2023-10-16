use anchor_lang::prelude::*;

declare_id!("5zA8X9aQbpyqQJejRL3mSNDKxDwRgUzgzmFZMnwH73g9");

#[program]
pub mod content_authenticator {
    use super::*;

    pub fn create_content_auth(
        ctx: Context<CreateContentAuth>,
        _seed: String,
        _cid: String,
        _sign: String,
        _user: Pubkey,
    ) -> Result<()> {
        let content_auth = &mut ctx.accounts.content_auth;

        content_auth.authority = ctx.accounts.authority.key();
        content_auth.user = _user;
        content_auth.cid = _cid;
        content_auth.sign = _sign;

        Ok(())
    }

    pub fn update_content_auth(
        ctx: Context<UpdateContentAuth>,
        _cid: String,
        _sign: String,
        _user: Pubkey,
    ) -> Result<()> {
        let content_auth = &mut ctx.accounts.content_auth;
        content_auth.cid = _cid;
        content_auth.sign = _sign;
        content_auth.user = _user;

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(_seed: String)]
pub struct CreateContentAuth<'info> {
    #[account(mut)]
    authority: Signer<'info>,
    #[account(
        init,
        seeds = [&_seed.as_bytes()[0..32]],
        bump,
        payer = authority,
        space = 300
    )]
    content_auth: Account<'info, ContentAuth>,
    system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateContentAuth<'info> {
    authority: Signer<'info>,
    #[account(mut)]
    content_auth: Account<'info, ContentAuth>,
}

#[account]
pub struct ContentAuth {
    authority: Pubkey,
    user: Pubkey,
    cid: String,
    sign: String,
}
