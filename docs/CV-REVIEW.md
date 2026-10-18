# CV review implementation notes

## Instant role match

The first `/cv-review/instant` run is available to a guest and is free. It
requires a target role and job description because the score is a role match,
not a general resume quality score. A random HTTP-only browser cookie maps to
one server-side free-review claim. After a completed guest review, that browser
must sign up or sign in before it can run another review; signed-in reviews use
the configured ENIP points cost. Clearing browser data can reset the guest
cookie, so this is a one-free-review-per-browser limit, not an identity-level
anti-abuse guarantee.

The flow accepts PDF, DOC, DOCX, RTF, and TXT resumes smaller than 4.5 MB. The
server checks the extension and file signature before sending it to HireLayer.
The provider parser is called with `do_not_store_data=true`. ENIP does not
persist the uploaded file or extracted resume text; a completed `cv_reviews`
row stores the target role, score, summary, and evaluated criteria. Guest
result access is scoped to the browser token; signed-in result access is
scoped to the student.

Configure the server-only `HIRELAYER_API_KEY` to enable provider calls. The
complimentary guest review needs the provider key but does not need an ENIP
points cost. Leave `ENIP_INSTANT_CV_REVIEW_COST` blank until the product owner
sets the cost for signed-in reviews. Leave `ENIP_INITIAL_POINTS` blank until
an initial points grant is approved. Both values accept positive whole numbers
only. Existing referral rewards remain configured separately by
`POINTS_PER_REFERRAL` and are not changed by CV reviews. HireLayer API credits
are separate from ENIP points.

Before deploying this feature, apply the generated migration with the normal
database release process. `npm run db:generate` creates the migration; do not
use `npm run db:migrate` until the target database and release have been
approved and backed up. The generated migrations create and extend
`cv_reviews`; they do not delete or rewrite existing records.

The `points_ledger` stores the debit only after a completed report is saved.
An in-progress `cv_reviews` row reserves the configured cost so concurrent
requests cannot spend the same points. Idempotency keys prevent duplicate
charges, and a failed provider call releases its reservation. A completed
report can be reopened without another charge. Provider calls can take several
minutes and use two HireLayer API credits for a normal review (parse and
Match v2 evaluation; creating the job and extracting its criteria is free).

Matching uses HireLayer Match v2 with the job's `language` set to `en`, so
criteria, the summary and explanations come back in English; evidence quotes
stay in the resume's language. Match v2 keeps jobs and candidates in a
workspace, so each review creates its own job and candidate (`cvr-<reviewId>`)
in the `enip-cv-review` workspace and deletes both as soon as the result is
read, whether the review succeeded or failed. Reviews saved before this change
may contain French text from Match v1.

## Alumni review

The alumni path opens ENIP discovery. The current chat composer stores an
attachment filename as message text and does not upload the resume file. The
interface discloses this; do not describe chat as a secure resume transfer
until a real attachment storage and access-control integration exists.
