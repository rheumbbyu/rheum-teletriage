# Idea Validation: RheumRoute PH

> Pre-booking screen for rheumatology teleconsults: should this booking be accepted as telemedicine, or must the patient be seen in person?
> Screening criteria are anchored on the APLAR recommendations on telemedicine in rheumatology (Ahmed et al., *Int J Rheum Dis* 2022;25:247–258, doi:10.1111/1756-185X.14286), cited below as "APLAR Rec n", and on the UP Manila Medical Informatics Unit telemedicine guidance series (Isip-Tan et al., 2020: *Telemedicine: Guidance for Physicians in the Philippines*; *Teleconsultation: Guidance for Filipino Clinicians*; *Preparing for Teleconsultation*; *Guidance for Assessing Telemedicine Vendors*; *Telemedicine: Guidance on Navigating Ethical and Legal Implications*), cited below as "UP MIU".

---

## Step 1 · Problem statement

Philippine rheumatology clinics accept teleconsult bookings by phone, text, Viber or email, often taken by a nurse or secretary. 
Whether a booking is accepted as telemedicine is rarely checked against explicit criteria. As a result, patients are booked for teleconsults they should not have: a new patient with no confirmed diagnosis, a patient last examined in person two years ago, a patient unable to do a virtual physical exam. 
These visits end with "you need to come in", so the slot is wasted and care is delayed. In the worst case, a patient with red-flag symptoms waits days for a routine teleconsult instead of going to the ER.

APLAR gives clear criteria that can be checked before booking:
- teleconsult follow-up should not run longer than 12 months without an in-person review (Rec 1);
- new patients without a confirmed diagnosis should not be managed by teleconsult (Rec 2);
- a pre-teleconsultation triage system could route unsuitable patients to in-person care (Rec 3).

APLAR also notes that triage can be done by an HCP or a non-HCP using screening questions (Rec 3), but
no standard screening tool exists. The physician "must be satisfied that the patient is suitable" before a teleconsult. The UP MIU guidance says specialty organizations should write their own guidance on which patients can be prioritised for teleconsult, and it gives the NHS diabetes triage as an example. No such guidance exists for Philippine rheumatology. 

Rheumatologists and rheumatology nurses need a quick, consistent pre-booking screen that decides whether a patient can be booked for telemedicine, and declines the booking when
guidelines require in-person care.

## Step 2 · Target user
| | | 
|---|---|
| **Primary users** | Rheumatology consultant, who makes the final decision; rheumatology fellow and nurse, who screen teleconsult bookings and escalate unclear cases to the consultant |
| **Secondary user** | Clinic secretary or referral coordinator who takes the booking request and may run the screen; unclear cases are escalated to the consultant |
| **Context** | Booking requests arrive through the day by phone, text or chat; the screen is done in the booking, days before a slot is confirmed |
| **Not the user** | Patients (the app gives no clinical advice to patients; the nurse or doctor communicates the decision) |

**Personas:**
- *Nurse Mildred, rheumatology clinic nurse, tertiary hospital in Metro Manila.* Takes 10–20 booking requests a day. Unsure when to say no to a teleconsult, and does not want to bother the consultant for every request.
- *Dr. Lisa, 2nd-year rheumatology fellow.* Screens bookings alongside the nurse, escalates unclear ones to the consultant, and wants the clinic's telemedicine rules applied the same way every time.

## Step 3 · Evidence the problem is real

### 3a. My own experience (primary evidence)
- 35 year old female with known psoriatic arthritis, booked one day prior for medication refill of her methotrexate because her primary rheumatologist is on leave. She has labs and symptoms like chest pain which she did not add in the initial history. She should have been seen in person since inflammatory arthritis are also at risk for dyslipidemia and coronary artery disease. The chest pain is a warning sign. 
- 70 year old female with cachexia, severe osteoarthritis etc is unable to do virtual physical examination or range of movements due to joint fusions. She was previously seen by another doctor online and was given steroids. The patient should have been examined in person to evaluate muscle wasting, nutrition care and psych evaluation. Steroids can aggravate the frailty. Patient should also be examined for underlying infection. 
- 22 year old male with chief complaint of knee pain. Photographs sent of both knees showed a large reddish knee effusion on the right. Patient also included fever in the chief complaint. He has a history of gout with maintenance medications. He should be seen in person for possible knee joint aspiration and sampling of the synovial fluid to rule out septic arthritis. 

### 3b. User interviews (aim for 3–5)
| # | Role | Key quote / finding | Confirms problem? |
|---|---|---|---|
| 1 | rheumatology nurse | "When was your last check up with the doctor?"; rheumatoid arthritis patient not seen in more than 2 years cannot be booked for telemedicine | Yes |
| 2 | rheumatology consultant | Photographs sent are blurry or with bad angles. Final decision to accept if will still push through with telemedicine or reschedule earlier for in person | Yes |
| 3 | clinic secretary | any patient with fever, chest pain, headache must be sent to the ER | Yes |

Interview script (5 min each):
1. Who accepts teleconsult bookings in your clinic, and how many per week? Mostly me or the secretary. 1-5 a week. 
2. What do you check before accepting a teleconsult booking? Is it written down anywhere? There is an infographic in my booking portal. If they have joint pains they must send picture of photo. 
3. Tell me about the last teleconsult that ended with "you need to come in." What should have been caught at booking? chief complaint of fever and headache. 
4. Has a patient with urgent symptoms ever been booked for a routine teleconsult? A patient with chest pain and history of psoriatic arthritis got admitted. They had booked 3 days ago for medication refill only. 
5. If a 1-minute checklist told you "accept", "accept with conditions" or "decline and book in-person", with the reason, would you use it? What would make you distrust it?  If i am the secretary and nurse i will leave it to the consultant. As the rheumatologist, it will be up to my discretion and consideration of other factors like if the patient is old or new or how severe or urgent the diagnosis is. or depending on the quality of the photograph of the joint they submitted: in terms of Color, Perspective, Clarity, Darkness, Brightness 

### 3c. Published / public evidence

**From APLAR 2022 (already in hand):**
- Rec 1 (GRADE B, 86% agreement): teleconsult follow-up for suitable patients over a period not exceeding 12 months, because disease activity fluctuates and 12 months is the longest follow-up studied.
- Rec 2 (GRADE C): in new patients, the odds of an accurate diagnosis fell after telemedicine was introduced (28.6% vs 57.4%; OR 0.30, 95% CI 0.16–0.53), with similar findings in UK and US cohorts. Telephone consults were less accurate than video or in-person for new referrals.
- Rec 3 (GRADE C): screening criteria used in published services included a prior in-person visit, no new complaints, not on biologics, and no planned intervention such as intra-articular injection or biopsy (India); detection of a flare or raised CRP prompting in-person review instead of teleconsult (Denmark RCT); exclusion of comorbidities needing hospital care.
- Fail-safe escalation to in-person was triggered in 7–45% of telemedicine encounters across studies (Rec 6), so conversions are common and screening could prevent some of them.
- Barriers to telerheumatology: limited access to technology, no lab testing or physical examination, and data-privacy concerns.
- Evidence quality: most recommendations are GRADE C, level 4, and APLAR states that triage-specific studies are needed. That is a gap this project can address.

**Local considerations:**
- Rheumatologists in the Philippines: 235. Based on Membership documents. Predominantly in Manila. Rheumatology Nurses: No official number. It depends if the nurse is assigned to the Rheumatology service. They do not always handle telemedicine. 
- There are no official, published guidelines for philippine telerheumatology. The DOH-NPC Joint Memorandum Circular 2020-0001 allows telemedicine but says "the gold standard for clinical care remains to be face-to-face consultation." The Medical Act of 1959 defines practice as including physical examination, a gap in the law. 
- Data Privacy Act of 2012 (RA 10173) and NPC guidance relevant to teleconsults (APLAR Rec 8). Survey of 152 Philippine physicians: 116 rated "obtaining consent before a teleconsult" as very important, and 142 rated privacy as very important. 
- Internet access / connectivity by region in the Philippines is erratic and unstable. Sending photos ahead of consult helps decision making 
- Telephone-medicine malpractice studies found faulty triage decisions were the second leading error, caused by incomplete history. That's direct evidence that structured screening matters.
- There are no Published rates of teleconsults converted to in-person visits, or no-show and rebooking rates.

## Step 4 · Existing alternatives

| Alternative | What it does | Gap |
|---|---|---|
| Nurse or secretary uses judgement and defers to consultant automatically for unclear cases | Some filtering | Inconsistent; criteria live in people's heads; staff hesitate to decline |
| Booking platforms (online scheduling) | Take the booking and payment | No clinical eligibility check |
| General chatbots | Can answer questions | Inconsistent, can invent facts, no fixed rules, no audit trail |

## Step 5 · Market / scope

- There is no research on number rheumatology clinics in the Philippines offering teleconsults.
- There is no hospital that specifically teaches rheumatology fellows how to do teleconsults. 
- Only PRC-licensed physicians may teleconsult patients physically in the Philippines. Treating a patient abroad depends on that country's laws. Confirm with patient where they are located; bookings from patients outside the Philippines are escalated to the consultant. Can be either accepted or denied teleconsultation booking by discretion. This project's output will always defer to the consultant's decision. 

## Step 6 · Differentiating angle

**A fixed, guideline-anchored pre-booking screen that a nurse can run in about a minute, with the reason for every decision.**

1. **Hard stops from APLAR, enforced in code:**
   - last in-person rheumatology review more than 12 months ago → decline teleconsult, book in-person (Rec 1);
   - new patient or no confirmed diagnosis → decline teleconsult, book in-person; if the patient has a GP, a doctor-to-doctor e-consult can be offered for interim guidance (Rec 2);
   - new or worsening symptoms, flare, or planned procedure → decline teleconsult, book in-person (Recs 3, 6);
   - unable to do virtual exam manoeuvres (show joints, range of movement), even with a helper → decline teleconsult, book in-person (UP MIU);
   - red-flag symptoms: chest pain, headache, seizure, fever → decline, direct to the ER now.
2. **Unanswered means not accepted:** a booking cannot be accepted while any required question is unanswered. If a nurse, fellow or secretary answers Unknown (e.g. date of last in-person visit), the booking is escalated to the consultant.
3. **Conditions before the call:** consent to telemedicine and its limits (overarching principle 2, Rec 8), video required, phone or text only means book in-person (clinic policy, stricter than Rec 5), monitoring labs and a symptom questionnaire done beforehand (Rec 9), a GP or nurse with the patient where feasible (Rec 7).
4. **"Teleconsult-eligible until" date:** shows when the 12-month window closes, so the next in-person visit can be booked ahead.
5. **Consultant judges, AI explains, code decides:** staff fill in the form by hand. The consultant rates submitted photos (colour, perspective, clarity, darkness, brightness). Claude uses the consultant's input and the APLAR and UP MIU guidance to write a rationale with citations. It can suggest a stricter outcome but never a looser one, and the decision is made by rules in code.
6. **Role-aware override:** only the consultant can override a proposal, with a written reason; fellows, nurses and secretaries escalate instead.

## Step 7 · Why now

- Telemedicine became routine in Philippine rheumatology during COVID-19 and has stayed, but booking eligibility was never standardised.
- APLAR (2022) published region-specific criteria (12-month limit, new-patient rule, pre-teleconsultation triage) that can be turned directly into a screening checklist.
- Nurses and non-clinical staff increasingly take bookings, and APLAR supports triage by an HCP or non-HCP using screening questions (Rec 3), so they need a tool they can apply consistently.
- The Philippines faces recurrent typhoons and flooding that disrupt services; APLAR Rec 4 favours scheduled teleconsults over unsupervised medication changes during disruption, which the screen must handle explicitly. 
- Telemedicine is ethical when the patient can't see a physician within a safe, acceptable time frame, and the physician must be able to recommend in-person care. That supports a decline-with-reason design.
- Growing institutional interest in safe, human-in-the-loop clinical AI (cite a PH or regional statement if available).

---

### Validation verdict
**Decision:** Proceed with changes.
- Nurse, fellow or secretary unsure, or any answer Unknown → escalate to the rheumatology consultant (PRD R10).
- The consultant must write a reason whenever they disagree with the proposal. In v2 these reasons are saved and reviewed periodically to update the rules (PRD F6, v2).