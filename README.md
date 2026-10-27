# northline-demo

A front-end prototype of private credit underwriting for one fictional loan, Northline Packaging. The fund lends. It does not buy the company.

A banner on the screen says that every name, term, and figure is illustrative / synthetic.

## Run

```bash
npm install
npm run dev
npm test
npm run build
```

## What is real

The credit math and the memo. Leverage, interest coverage, the proposed covenant, headroom, the downside case, recovery, and net funding are computed from the assumptions every time. The memo is a photo of those figures. A template writes the sentences around them. The template does not contain hard-coded numbers.

## What is simulated

The company, the sponsor, the team, the other rows on the pipeline, and the diligence documents. Those documents are a name and a status only. The other deals do not open.

## What is left out

Intercreditor agreement, revolver, KYC, PIK interest, syndication, post-close monitoring, a backend, a database, calls to a language model, and the bridge from reported EBITDA to adjusted EBITDA.

EBITDA is a single base-case figure. The reported-to-adjusted bridge and the add-backs are left out.

Fees and OID are left out of sources and uses. At a 2% OID the fund would wire $176.4M for $180M of face amount. That net amount is shown on the instrument only. OID is not part of the coupon.

Recovery is the downside value of the company divided into the loan, and never more than the loan. It leaves out the cost and the time of a workout.

The 30% cushion is the cushion this fund proposes, not a market rule. SOFR and the distressed multiple are illustrative and have no source. The whole terms table is synthetic.

`docs/schema.sql` is the relational shape this screen mirrors. The demo does not run it. Derived figures are not stored there. A generated memo would keep a photo of the figures, separate from the live calculation.
