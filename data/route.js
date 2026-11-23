// DeadGod% Repentance+ route, adapted from D0ggy's and neonomi's split sheet
// ("Deadgod% Splits Sheet", NEW RUN tab, 2026). Tips are paraphrased from their notes.
// Format: label | requirements | tip | D0ggy's PB segment time and neonomi's segment time ("-" when blank)
// (the sheet's "PB split time" and "Neonomi split time" columns, used to compare splits).
// Requirements: @char sets the character (ids from js/common.js, t_ = tainted);
// boss codes MH IS SA BB LA MS BR HU GR (Greed) GG (Greedier) DE MO BE; ALL = all 12 on Hard;
// -XX leaves one out of ALL; aN = achievement N; cN = challenge N; hN = Mom's Heart kill N;
// items = full collection; opt = optional step.
// A Lamb run also gives Mom's Heart and Satan; a Chest run also gives Mom's Heart and Isaac.
window.DG_ROUTE = [
  ['Opening', `
Isaac – Greed | @isaac GR | Lucky Pennies and Special Shopkeepers. Unlocking Azazel early makes the first Mom run easy | 17:19.482 15:44.255
Challenge #3 Head Trauma | c3 | Ehwaz opens the way to Sheol after Mom's Heart | 13:11.233 9:32.159
Challenge #14 It's in the Cards | c14 | SMB Super Fan adds an extra HP up to the pool | 12:10.564 11:02.250
First Mom | a4 | Play Azazel | 7:11.548 9:14.940
Mom's Heart 1 | h1 | Azazel. Find 2 HP ups and take a red heart hit in the floor 6 and 7 boss fights to force a devil/angel room after Mom's Heart. Boss challenge rooms help | 21:23.214 13:23.251
Mom's Heart 2 | h2 |  | 11:51.060 12:40.107
Mom's Heart 3 | h3 |  | 16:21.372 15:12.503
Mom's Heart 4 | h4 |  | 13:56.966 14:49.407
Mom's Heart 5 | h5 |  | 19:02.454 16:06.287
Mom's Heart 6 | h6 |  | 14:59.991 12:37.279
Mom's Heart 7 | h7 |  | 16:30.721 13:46.509
Mom's Heart 8 | h8 |  | 14:52.067 18:38.501
Mom's Heart 9 | h9 |  | 13:04.408 11:43.531
Mom's Heart 10 | h10 | 10 clean heart kills opens the Blue Womb | 20:17.466 17:53.006
Challenge #2 High Brow | c2 | Jera | 22:41.859 8:02.504
Challenge #6 Solar System | c6 | Perthro | 26:34.952 9:27.887
Challenge #9 Demo Man | c9 | Chaos Card, handy for Hush | 8:08.077 10:31.078
Challenge #17 Waka Waka | c17 | Death's Touch | 13:18.794 10:18.552
`],
  ['First marks', `
Azazel – Hush | @azazel HU | Maw of the Void. First Hush. Skip Boss Rush here | 17:59.188 39:05.176
??? – Chest | @bluebaby BB | The D6. Skip Delirium for now | 45:04.258 37:51.000
Isaac – Lamb | @isaac LA | Mom's Knife and Missing Poster. Skip Boss Rush | 35:21.117 43:24.000
Azazel – Forgotten, no Delirium | @azazel BR LA MS a390 | The Nail, Demon Baby and Mega Satan, plus The Forgotten | 27:16.530 21:09.000
Challenge #31 Backasswards | c31 | Kill Mega Satan at least once first. Lazarus buff | 1:02:14.945 13:09.000
Lazarus – Bethany, Lamb, no Boss Rush | @lazarus LA a404 | Bethany needs Mom's Heart on Hard without dying; after that you can revive freely. Pandora's Box helps Moving Box later | 28:00.020 31:57.000
Azazel – Chest | @azazel BB | Abaddon and Satanic Bible. Skip Delirium | - 51:29.000
Azazel – Greed | @azazel GR | Unlocks Lilith. Unlock Magdalene now if you haven't | 23:41.706 11:24.000
Bethany – Lamb, Mother, no Hush | @bethany LA MO | You should have 3 Hush kills by now, so skip him. No Boss Rush | 1:32:26.544 51:29.000
Eden – Chest, Beast | @eden BB BE | Blank Card, Eden's Soul/Blessing, Undefined | 59:12.236 54:36.059
`],
  ['Challenge block', `
Challenge #45 DELETE THIS | c45 | Reset until you get a good item | 1:05:38.748 14:56.274
Challenge #34 Ultra Hard | c34 | Reset for a Library start (or a strong treasure room) | 1:28:59.932 19:21.000
Challenge #37 Bloody Mary | c37 |  | 20:40.719 33:30.000
Challenge #39 Isaac's Awakening | c39 | Spirit Sword. Keep your HP up | 14:49.686 16:09.137
Challenge #32 Aprils Fool | c32 | Magdalene buff | 17:44.621 25:01.989
Challenge #5 The Tank | c5 | Ansuz | 12:46.474 11:22.142
Challenge #8 Cat Got Your Tongue | c8 | Algiz | 9:15.031 7:02.791
Challenge #10 Cursed! | c10 | Credit Card | 10:38.222 7:31.320
Challenge #18 The Host | c18 | Tech .5 | 10:35.895 7:40.621
Challenge #20 Purist | c20 | Berkano (good in Repentance+). Look for a good devil deal | 14:55.877 8:56.998
Challenge #21 XXXXXXXXL | c21 | Golden Heart | 27:40.916 25:39.837
Challenge #22 SPEED! | c22 | Get out of Jail Free Card | 14:32.057 11:01.214
Challenge #23 Blue Bomber | c23 | Golden Bomb. No items needed | 7:43.820 7:15.028
Challenge #29 Onan's Streak | c29 | Kidney Stone. Don't pick up anything that deals damage besides your tears | 15:57.546 13:41.153
Challenge #33 Pokey Mans | c33 | Charged Key | 17:09.144 19:09.565
`],
  ['Characters and win streaks', `
Lilith – Chest, Lamb, Beast, no Boss Rush | @lilith BB LA BE | Skip Boss Rush (Immaculate Conception is a bad unlock) | 1:46:27.199 1:47:48.104
Judas – Lamb, Beast, no Delirium | @judas LA BE | Curved Horn and Redemption. Skip optional goals | 50:15.569 56:29.412
Jacob & Esau – All but Greed | @jacob ALL -GR | Touch Vanishing Twin (it doesn't spawn in Greed mode) | 6:20:02.560 2:06:43.184
T. Lilith – All but Greed | @t_lilith ALL -GR | Do Delirium last so Gello shows up next run. Finish the last run properly for the win streak | 2:03:02.906 1:41:51.924
Samson – Greed | @samson GR | Lusty Blood. Win streak 2 | 27:42.331 13:21.051
T. Jacob – Greed | @t_jacob GR | Fast. Win streak 3 | 19:52.143 14:51.290
Lilith – Greed | @lilith GR | Look for Ball of Bandages. Win streak 4 | 13:41.226 12:05.397
T. Judas – Greed (skip if Greedier is open) | @t_judas GR opt | Win streak 5 | 14:45.075 15:39.280
T. Lilith – Greed (skip if Greedier is open) | @t_lilith GR opt |  | 13:45.188 -
Isaac – Greedier | @isaac GG a323 | 5-win streak with different characters: 5 Nights at Mom's | 18:18.757 14:54.349
Jacob & Esau – Greedier | @jacob GG | Genesis | 18:36.039 16:52.358
T. Jacob – Greedier | @t_jacob GG | The Sun and the Moon | 15:53.352 15:32.821
Apollyon – Greedier | @apollyon GG | Black Rune | 19:08.038 19:47.136
T. Eden – Greedier | @t_eden GG | The World | 35:30.506 18:11.285
`],
  ['Tainted unlocks', `
Isaac – Beast | @isaac BE | Options? | 34:51.603 25:29.235
T. Isaac – Greedier | @t_isaac GG | The Stars | 25:04.815 16:01.030
Magdalene – Beast | @magdalene BE a475 | Unlock T. Magdalene in the Home closet | 21:57.991 26:50.900
T. Magdalene – Greedier | @t_magdalene GG | The Lovers | 12:33.452 19:20.413
??? – Beast | @bluebaby BE a478 | Unlock T. ??? in the Home closet | 21:07.521 29:33.796
T. ??? – Greedier | @t_bluebaby GG | The Emperor (more Little Gish/C.H.A.D. chances) | 31:05.720 17:18.813
Magdalene – Lamb | @magdalene LA | Maggy's Faith | 30:33.031 51:27.839
Challenge #38 Baptism by Fire | c38 | Purgatory | 12:23.868 9:10.598
T. Jacob – All | @t_jacob ALL |  | 1:59:23.351 1:41:31.358
Cain – Mother | @cain MO | Guppy's Eye. Boss Rush too if it's on the way | 25:55.996 27:48.105
T. Isaac – All | @t_isaac ALL |  | - 1:48:25.677
Eve – Chest, Lamb, Beast | @eve BB LA BE | Sacrificial Dagger. Delirium is optional here | - 1:35:55.052
Challenge #4 Darkness Falls | c4 | Dagaz | - 10:47.044
T. Eve – All but Beast | @t_eve ALL -BE | Sumptorium | - 1:43:08.422
Forgotten – Lamb, Boss Rush | @forgotten LA BR | Get Divorce Papers while holding Dead Cat to unlock The Lost. Skip Hush, do Delirium | - 33:04.938
T. Judas – Mega Satan | @t_judas MS | Black Sack. Boss Rush and Hush are optional | - 32:51.651
`],
  ['The Lost segment', `
Apollyon – All but Mother | @apollyon ALL -MO | Start this segment once The Lost is unlocked. Lots of trinkets | 13:10:46.029 1:27:26.002
Challenge #13 Beans! | c13 |  | 10:24.310 7:39.127
Challenge #15 Slow Roll | c15 |  | 7:46.366 7:13.566
Challenge #27 BRAINS! | c27 |  | 58:34.292 17:14.333
T. Eve – Beast | @t_eve BE | Heartbreak | 21:38.726 25:16.949
The Lost – It's the Key | a327 | Beat The Lamb without picking up hearts, coins or bombs | 23:22.774 46:06.585
The Lost – All | @lost ALL | Godhead | 1:18:29.295 1:49:19.315
`],
  ['Tainted cleanup', `
T. Magdalene – All | @t_magdalene ALL | Do it now before lots of weak items are unlocked | 56:23.222 2:03:37.434
Keeper – Chest, Mother | @keeper BB MO | Wooden Nickel, Keeper's Sack | 1:15:32.405 57:38.343
Samson – Beast | @samson BE a480 | Unlock T. Samson | 35:27.920 23:12.469
T. Samson – Beast, Mega Satan | @t_samson BE MS | Crane Game, Larynx | 1:04:37.433 1:07:07.796
T. Samson – Greedier | @t_samson GG | Strength | 17:34.982 -
Lazarus – Beast | @lazarus BE a482 | Unlock T. Lazarus | 23:41.531 20:16.997
T. Lazarus – All | @t_lazarus ALL | Slow character | 2:46:39.689 2:13:56.719
Keeper – All | @keeper ALL | Fast Greedier | 1:15:18.682 1:14:26.070
T. Keeper – Chest, Lamb | @t_keeper BB LA |  | 1:44:35.145 1:14:33.550
T. Keeper – Greedier | @t_keeper GG | The Hanged Man | 14:55.854 -
T. Lost – All | @t_lost ALL |  | 2:26:28.254 2:54:05.592
Cain – Beast | @cain BE a476 | Touch A Pound of Flesh (it doesn't spawn in Greed mode). Unlock T. Cain | 16:26.217 29:09.036
T. Cain – All but Greedier | @t_cain ALL -GG | Slow character | 3:57:54.923 1:49:19.162
T. Eden – All but Beast | @t_eden ALL -BE |  | 1:40:22.708 1:33:49.054
Bethany – All but Greedier | @bethany ALL -GG |  | 55:05.933 49:09.150
Forgotten – Beast | @forgotten BE | Spirit Shackles | 23:46.079 23:08.107
T. Forgotten – All | @t_forgotten ALL |  | 2:04:33.161 2:26:03.823
`],
  ['Challenge cleanup', `
Challenge #1 Pitch Black | c1 | Hagalaz | 10:12.784 10:45.843
Challenge #12 When Life Gives You Lemons | c12 |  | 11:37.001 10:38.078
Challenge #16 Computer Savvy | c16 | Robo-Baby 2.0 | 8:33.972 6:13.170
Challenge #19 The Family Man | c19 | Epic Fetus | 18:18.746 14:06.243
Challenge #26 I RULE! | c26 |  | 21:21.745 12:01.821
Challenge #28 PRIDE DAY! | c28 | D8 | 17:49.248 19:37.125
Challenge #30 The Guardian | c30 |  | 9:02.379 11:24.054
Challenge #35 Pong | c35 |  | 25:37.888 21:02.158
Challenge #36 Scat Man | c36 |  | 10:48.965 11:35.174
Challenge #40 Seeing Double | c40 |  | 22:49.381 26:49.080
Challenge #42 Hot Potato | c42 |  | 15:10.598 22:35.437
Challenge #43 Cantripped! | c43 |  | 15:25.151 9:09.566
Challenge #44 Red Redemption | c44 | Mapping or teleport items help a lot | 15:02.486 10:15.799
`],
  ['"All" cleanup', `
T. Keeper – All | @t_keeper ALL |  | 19:44.811 56:49.815
T. Samson – All | @t_samson ALL |  | 39:08.654 41:05.170
Eden – Lamb, Mother | @eden LA MO | Mystery Sack, 'M | 51:19.438 1:07:21.910
Judas – Greedier | @judas GG |  | 20:33.976 16:59.461
T. ??? – All | @t_bluebaby ALL | From here, alternate weak and good unlocks so new items show up every other run | 2:34:18.665 1:58:19.743
Isaac – All | @isaac ALL |  | 1:01:20.252 46:53.490
Cain – All | @cain ALL |  | 1:20:20.439 1:13:49.286
Eve – All | @eve ALL |  | 49:05.125 52:39.097
Lazarus – All | @lazarus ALL | If Marbles isn't unlocked, do it in the Greedier run | 1:33:17.175 58:49.352
Lilith – All | @lilith ALL |  | 53:45.697 43:32.226
Apollyon – All | @apollyon ALL |  | 23:38.391 25:34.083
Judas – Chest | @judas BB BR HU DE | Boss Rush, Hush and Delirium too. Mother can be done any run where you find Judas' Shadow | 35:49.641 36:19.259
Azazel – All | @azazel ALL |  | 1:16:58.894 1:19:44.229
T. Azazel – All | @t_azazel ALL |  | 1:48:29.621 1:54:18.880
T. Apollyon – All | @t_apollyon ALL |  | 2:13:38.400 1:55:03.032
T. Judas – All | @t_judas ALL |  | 1:31:33.747 1:39:39.392
T. Bethany – All | @t_bethany ALL |  | 2:11:21.522 1:36:09.577
Samson – All | @samson ALL | Touch the Bloody Lust item | 2:13:54.947 2:00:00.357
Magdalene – Chest | @magdalene BB |  | 22:42.974 26:57.183
Forgotten – All | @forgotten ALL |  | 1:24:46.022 1:29:16.134
??? – All | @bluebaby ALL |  | 1:06:39.545 1:01:59.999
Judas – Mother | @judas MO | Any run where you find Judas' Shadow | 41:20.194 30:41.807
Magdalene – Mother, Greedier | @magdalene MO GG |  | 41:21.472 44:29.818
Eden – Greedier | @eden GG | Fast | 16:09.968 18:23.477
Bethany – Greedier | @bethany GG |  | 19:37.741 18:15.861
T. Lilith – Greedier | @t_lilith GG |  | 15:07.532 18:36.628
T. Cain – Greedier | @t_cain GG |  | 21:59.544 27:13.812
T. Eden – Beast | @t_eden BE | TMTRAINER | 18:23.372 30:58.079
`],
  ['Finish', `
100 deaths | a30 | T. Eden deaths reroll treasure items; fast deaths on Eden also work | 13:37.084 13:46.391
Full collection | items | Eden resets for random starting items | 1:31:05.443 38:34.401
Challenge #7 Suicide King | c7 |  | 11:31.934 11:38.846
Challenge #11 Glass Cannon | c11 |  | 12:27.735 12:04.926
Challenge #24 PAY TO PLAY | c24 | Can be tough | 18:47.891 14:47.118
Challenge #25 Have a Heart | c25 |  | 13:04.180 14:31.864
Challenge #41 Pica Run | c41 |  | 14:14.231 14:14.231
Repentance+ online achievements | a638 a639 a640 a641 | Play online, win online, win an online daily. Speedrunners on PC start from a save that already has these
Death Certificate | a636 |
Dead God | a637 |
`],
];

// Goals D0ggy keeps in mind across every run (achievement ids), in the sheet's order.
window.DG_SIDE_GOALS = [354, 336, 147, 82, 406, 64, 389, 27, 36, 148, 19, 545, 523, 324, 384, 382, 377, 378, 330, 138, 385, 366, 337, 326, 327, 24, 25, 23, 361, 386, 258];
