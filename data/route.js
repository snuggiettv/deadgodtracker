// DeadGod% Repentance+ route, adapted from D0ggy's and neonomi's split sheet
// ("Deadgod% Splits Sheet", NEW RUN tab, 2026). Tips are paraphrased from their notes.
// Format: label | requirements | tip
// Requirements: @char sets the character (ids from js/common.js, t_ = tainted);
// boss codes MH IS SA BB LA MS BR HU GR (Greed) GG (Greedier) DE MO BE; ALL = all 12 on Hard;
// -XX leaves one out of ALL; aN = achievement N; cN = challenge N; hN = Mom's Heart kill N;
// items = full collection; opt = optional step.
// A Lamb run also gives Mom's Heart and Satan; a Chest run also gives Mom's Heart and Isaac.
window.DG_ROUTE = [
  ['Opening', `
Isaac – Greed | @isaac GR | Lucky Pennies and Special Shopkeepers. Unlocking Azazel early makes the first Mom run easy
Challenge #3 Head Trauma | c3 | Ehwaz opens the way to Sheol after Mom's Heart
Challenge #14 It's in the Cards | c14 | SMB Super Fan adds an extra HP up to the pool
First Mom | a4 | Play Azazel
Mom's Heart 1 | h1 | Azazel. Find 2 HP ups and take a red heart hit in the floor 6 and 7 boss fights to force a devil/angel room after Mom's Heart. Boss challenge rooms help
Mom's Heart 2 | h2 |
Mom's Heart 3 | h3 |
Mom's Heart 4 | h4 |
Mom's Heart 5 | h5 |
Mom's Heart 6 | h6 |
Mom's Heart 7 | h7 |
Mom's Heart 8 | h8 |
Mom's Heart 9 | h9 |
Mom's Heart 10 | h10 | 10 clean heart kills opens the Blue Womb
Challenge #2 High Brow | c2 | Jera
Challenge #6 Solar System | c6 | Perthro
Challenge #9 Demo Man | c9 | Chaos Card, handy for Hush
Challenge #17 Waka Waka | c17 | Death's Touch
`],
  ['First marks', `
Azazel – Hush | @azazel HU | Maw of the Void. First Hush. Skip Boss Rush here
??? – Chest | @bluebaby BB | The D6. Skip Delirium for now
Isaac – Lamb | @isaac LA | Mom's Knife and Missing Poster. Skip Boss Rush
Azazel – Forgotten, no Delirium | @azazel BR LA MS a390 | The Nail, Demon Baby and Mega Satan, plus The Forgotten
Challenge #31 Backasswards | c31 | Kill Mega Satan at least once first. Lazarus buff
Lazarus – Bethany, Lamb, no Boss Rush | @lazarus LA a404 | Bethany needs Mom's Heart on Hard without dying; after that you can revive freely. Pandora's Box helps Moving Box later
Azazel – Chest | @azazel BB | Abaddon and Satanic Bible. Skip Delirium
Azazel – Greed | @azazel GR | Unlocks Lilith. Unlock Magdalene now if you haven't
Bethany – Lamb, Mother, no Hush | @bethany LA MO | You should have 3 Hush kills by now, so skip him. No Boss Rush
Eden – Chest, Beast | @eden BB BE | Blank Card, Eden's Soul/Blessing, Undefined
`],
  ['Challenge block', `
Challenge #45 DELETE THIS | c45 | Reset until you get a good item
Challenge #34 Ultra Hard | c34 | Reset for a Library start (or a strong treasure room)
Challenge #37 Bloody Mary | c37 |
Challenge #39 Isaac's Awakening | c39 | Spirit Sword. Keep your HP up
Challenge #32 Aprils Fool | c32 | Magdalene buff
Challenge #5 The Tank | c5 | Ansuz
Challenge #8 Cat Got Your Tongue | c8 | Algiz
Challenge #10 Cursed! | c10 | Credit Card
Challenge #18 The Host | c18 | Tech .5
Challenge #20 Purist | c20 | Berkano (good in Repentance+). Look for a good devil deal
Challenge #21 XXXXXXXXL | c21 | Golden Heart
Challenge #22 SPEED! | c22 | Get out of Jail Free Card
Challenge #23 Blue Bomber | c23 | Golden Bomb. No items needed
Challenge #29 Onan's Streak | c29 | Kidney Stone. Don't pick up anything that deals damage besides your tears
Challenge #33 Pokey Mans | c33 | Charged Key
`],
  ['Characters and win streaks', `
Lilith – Chest, Lamb, Beast, no Boss Rush | @lilith BB LA BE | Skip Boss Rush (Immaculate Conception is a bad unlock)
Judas – Lamb, Beast, no Delirium | @judas LA BE | Curved Horn and Redemption. Skip optional goals
Jacob & Esau – All but Greed | @jacob ALL -GR | Touch Vanishing Twin (it doesn't spawn in Greed mode)
T. Lilith – All but Greed | @t_lilith ALL -GR | Do Delirium last so Gello shows up next run. Finish the last run properly for the win streak
Samson – Greed | @samson GR | Lusty Blood. Win streak 2
T. Jacob – Greed | @t_jacob GR | Fast. Win streak 3
Lilith – Greed | @lilith GR | Look for Ball of Bandages. Win streak 4
T. Judas – Greed (skip if Greedier is open) | @t_judas GR opt | Win streak 5
T. Lilith – Greed (skip if Greedier is open) | @t_lilith GR opt |
Isaac – Greedier | @isaac GG a323 | 5-win streak with different characters: 5 Nights at Mom's
Jacob & Esau – Greedier | @jacob GG | Genesis
T. Jacob – Greedier | @t_jacob GG | The Sun and the Moon
Apollyon – Greedier | @apollyon GG | Black Rune
T. Eden – Greedier | @t_eden GG | The World
`],
  ['Tainted unlocks', `
Isaac – Beast | @isaac BE | Options?
T. Isaac – Greedier | @t_isaac GG | The Stars
Magdalene – Beast | @magdalene BE a475 | Unlock T. Magdalene in the Home closet
T. Magdalene – Greedier | @t_magdalene GG | The Lovers
??? – Beast | @bluebaby BE a478 | Unlock T. ??? in the Home closet
T. ??? – Greedier | @t_bluebaby GG | The Emperor (more Little Gish/C.H.A.D. chances)
Magdalene – Lamb | @magdalene LA | Maggy's Faith
Challenge #38 Baptism by Fire | c38 | Purgatory
T. Jacob – All | @t_jacob ALL |
Cain – Mother | @cain MO | Guppy's Eye. Boss Rush too if it's on the way
T. Isaac – All | @t_isaac ALL |
Eve – Chest, Lamb, Beast | @eve BB LA BE | Sacrificial Dagger. Delirium is optional here
Challenge #4 Darkness Falls | c4 | Dagaz
T. Eve – All but Beast | @t_eve ALL -BE | Sumptorium
Forgotten – Lamb, Boss Rush | @forgotten LA BR | Get Divorce Papers while holding Dead Cat to unlock The Lost. Skip Hush, do Delirium
T. Judas – Mega Satan | @t_judas MS | Black Sack. Boss Rush and Hush are optional
`],
  ['The Lost segment', `
Apollyon – All but Mother | @apollyon ALL -MO | Start this segment once The Lost is unlocked. Lots of trinkets
Challenge #13 Beans! | c13 |
Challenge #15 Slow Roll | c15 |
Challenge #27 BRAINS! | c27 |
T. Eve – Beast | @t_eve BE | Heartbreak
The Lost – It's the Key | a327 | Beat The Lamb without picking up hearts, coins or bombs
The Lost – All | @lost ALL | Godhead
`],
  ['Tainted cleanup', `
T. Magdalene – All | @t_magdalene ALL | Do it now before lots of weak items are unlocked
Keeper – Chest, Mother | @keeper BB MO | Wooden Nickel, Keeper's Sack
Samson – Beast | @samson BE a480 | Unlock T. Samson
T. Samson – Beast, Mega Satan | @t_samson BE MS | Crane Game, Larynx
T. Samson – Greedier | @t_samson GG | Strength
Lazarus – Beast | @lazarus BE a482 | Unlock T. Lazarus
T. Lazarus – All | @t_lazarus ALL | Slow character
Keeper – All | @keeper ALL | Fast Greedier
T. Keeper – Chest, Lamb | @t_keeper BB LA |
T. Keeper – Greedier | @t_keeper GG | The Hanged Man
T. Lost – All | @t_lost ALL |
Cain – Beast | @cain BE a476 | Touch A Pound of Flesh (it doesn't spawn in Greed mode). Unlock T. Cain
T. Cain – All but Greedier | @t_cain ALL -GG | Slow character
T. Eden – All but Beast | @t_eden ALL -BE |
Bethany – All but Greedier | @bethany ALL -GG |
Forgotten – Beast | @forgotten BE | Spirit Shackles
T. Forgotten – All | @t_forgotten ALL |
`],
  ['Challenge cleanup', `
Challenge #1 Pitch Black | c1 | Hagalaz
Challenge #12 When Life Gives You Lemons | c12 |
Challenge #16 Computer Savvy | c16 | Robo-Baby 2.0
Challenge #19 The Family Man | c19 | Epic Fetus
Challenge #26 I RULE! | c26 |
Challenge #28 PRIDE DAY! | c28 | D8
Challenge #30 The Guardian | c30 |
Challenge #35 Pong | c35 |
Challenge #36 Scat Man | c36 |
Challenge #40 Seeing Double | c40 |
Challenge #42 Hot Potato | c42 |
Challenge #43 Cantripped! | c43 |
Challenge #44 Red Redemption | c44 | Mapping or teleport items help a lot
`],
  ['"All" cleanup', `
T. Keeper – All | @t_keeper ALL |
T. Samson – All | @t_samson ALL |
Eden – Lamb, Mother | @eden LA MO | Mystery Sack, 'M
Judas – Greedier | @judas GG |
T. ??? – All | @t_bluebaby ALL | From here, alternate weak and good unlocks so new items show up every other run
Isaac – All | @isaac ALL |
Cain – All | @cain ALL |
Eve – All | @eve ALL |
Lazarus – All | @lazarus ALL | If Marbles isn't unlocked, do it in the Greedier run
Lilith – All | @lilith ALL |
Apollyon – All | @apollyon ALL |
Judas – Chest | @judas BB BR HU DE | Boss Rush, Hush and Delirium too. Mother can be done any run where you find Judas' Shadow
Azazel – All | @azazel ALL |
T. Azazel – All | @t_azazel ALL |
T. Apollyon – All | @t_apollyon ALL |
T. Judas – All | @t_judas ALL |
T. Bethany – All | @t_bethany ALL |
Samson – All | @samson ALL | Touch the Bloody Lust item
Magdalene – Chest | @magdalene BB |
Forgotten – All | @forgotten ALL |
??? – All | @bluebaby ALL |
Judas – Mother | @judas MO | Any run where you find Judas' Shadow
Magdalene – Mother, Greedier | @magdalene MO GG |
Eden – Greedier | @eden GG | Fast
Bethany – Greedier | @bethany GG |
T. Lilith – Greedier | @t_lilith GG |
T. Cain – Greedier | @t_cain GG |
T. Eden – Beast | @t_eden BE | TMTRAINER
`],
  ['Finish', `
100 deaths | a30 | T. Eden deaths reroll treasure items; fast deaths on Eden also work
Full collection | items | Eden resets for random starting items
Challenge #7 Suicide King | c7 |
Challenge #11 Glass Cannon | c11 |
Challenge #24 PAY TO PLAY | c24 | Can be tough
Challenge #25 Have a Heart | c25 |
Challenge #41 Pica Run | c41 |
Repentance+ online achievements | a638 a639 a640 a641 | Play online, win online, win an online daily. Speedrunners on PC start from a save that already has these
Death Certificate | a636 |
Dead God | a637 |
`],
];

// Goals D0ggy keeps in mind across every run (achievement ids), in the sheet's order.
window.DG_SIDE_GOALS = [354, 336, 147, 82, 406, 64, 389, 27, 36, 148, 19, 545, 523, 324, 384, 382, 377, 378, 330, 138, 385, 366, 337, 326, 327, 24, 25, 23, 361, 386, 258];
