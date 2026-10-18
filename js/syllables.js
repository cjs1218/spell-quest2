// Teaching-friendly syllable splits for every statutory word.
// Splits keep letter teams together (ough, tion, ture, ie) so each chunk
// is something a child can say and spell, rather than strict dictionary
// hyphenation. Checked by tools/check-words.mjs.

const RAW = `
the the | a a | do do | to to | today to-day | of of | said said | says says | is is | his his
has has | was was | were were | are are | I I | you you | your your | they they | our our
be be | he he | me me | she she | we we | no no | go go | so so | by by | my my | here here
there there | where where | love love | come come | some some | one one | once once | put put
push push | pull pull | full full | ask ask | friend friend | school school | house house

door door | floor floor | poor poor | find find | kind kind | mind mind | behind be-hind
child child | children chil-dren | wild wild | climb climb | old old | cold cold | gold gold
hold hold | told told | most most | only on-ly | both both | every ev-er-y
everybody ev-er-y-bod-y | even e-ven | great great | break break | steak steak | after af-ter
fast fast | last last | past past | father fa-ther | class class | grass grass | pass pass
plant plant | path path | bath bath | move move | prove prove | improve im-prove | who who
could could | should should | would would | sure sure | sugar su-gar | because be-cause
pretty pret-ty | beautiful beau-ti-ful | eye eye | hour hour | any an-y | many man-y
whole whole | clothes clothes | busy bus-y | people peo-ple | water wa-ter | again a-gain
half half | money mon-ey | parent par-ent | Christmas Christ-mas | Mr Mr | Mrs Mrs

accident ac-ci-dent | accidentally ac-ci-den-tal-ly | actual ac-tu-al | actually ac-tu-al-ly
address ad-dress | answer an-swer | appear ap-pear | arrive ar-rive | believe be-lieve
bicycle bi-cy-cle | breath breath | breathe breathe | build build | busy bus-y
business busi-ness | calendar cal-en-dar | caught caught | centre cen-tre | century cen-tu-ry
certain cer-tain | circle cir-cle | complete com-plete | consider con-sid-er | continue con-tin-ue
decide de-cide | describe de-scribe | different dif-fer-ent | difficult dif-fi-cult
disappear dis-ap-pear | early ear-ly | earth earth | eight eight | eighth eighth | enough e-nough
exercise ex-er-cise | experience ex-pe-ri-ence | experiment ex-per-i-ment | extreme ex-treme
famous fa-mous | favourite fa-vour-ite | February Feb-ru-ar-y | forward for-ward
forwards for-wards | fruit fruit | grammar gram-mar | group group | guard guard | guide guide
heard heard | heart heart | height height | history his-to-ry | imagine im-ag-ine
increase in-crease | important im-por-tant | interest in-ter-est | island is-land
knowledge know-ledge | learn learn | length length | library li-brar-y | material ma-te-ri-al
medicine med-i-cine | mention men-tion | minute min-ute | natural nat-u-ral | naughty naugh-ty
notice no-tice | occasion oc-ca-sion | occasionally oc-ca-sion-al-ly | often of-ten
opposite op-po-site | ordinary or-di-nar-y | particular par-tic-u-lar | peculiar pe-cu-li-ar
perhaps per-haps | popular pop-u-lar | position po-si-tion | possess pos-sess
possession pos-ses-sion | possible pos-si-ble | potatoes po-ta-toes | pressure pres-sure
probably prob-ab-ly | promise prom-ise | purpose pur-pose | quarter quar-ter | question ques-tion
recent re-cent | regular reg-u-lar | reign reign | remember re-mem-ber | sentence sen-tence
separate sep-a-rate | special spe-cial | straight straight | strange strange | strength strength
suppose sup-pose | surprise sur-prise | therefore there-fore | though though | although al-though
thought thought | through through | various var-i-ous | weight weight | woman wom-an | women wom-en

accommodate ac-com-mo-date | accompany ac-com-pa-ny | according ac-cord-ing | achieve a-chieve
aggressive ag-gres-sive | amateur am-a-teur | ancient an-cient | apparent ap-par-ent
appreciate ap-pre-ci-ate | attached at-tached | available a-vail-a-ble | average av-er-age
awkward awk-ward | bargain bar-gain | bruise bruise | category cat-e-go-ry | cemetery cem-e-ter-y
committee com-mit-tee | communicate com-mu-ni-cate | community com-mu-ni-ty
competition com-pe-ti-tion | conscience con-science | conscious con-scious
controversy con-tro-ver-sy | convenience con-ven-i-ence | correspond cor-re-spond
criticise crit-i-cise | curiosity cu-ri-os-i-ty | definite def-i-nite | desperate des-per-ate
determined de-ter-mined | develop de-vel-op | dictionary dic-tion-ar-y | disastrous dis-as-trous
embarrass em-bar-rass | environment en-vi-ron-ment | equip e-quip | equipped e-quipped
equipment e-quip-ment | especially es-pe-cial-ly | exaggerate ex-ag-ger-ate
excellent ex-cel-lent | existence ex-is-tence | explanation ex-pla-na-tion | familiar fa-mil-iar
foreign for-eign | forty for-ty | frequently fre-quent-ly | government gov-ern-ment
guarantee guar-an-tee | harass har-ass | hindrance hin-drance | identity i-den-ti-ty
immediate im-me-di-ate | immediately im-me-di-ate-ly | individual in-di-vid-u-al
interfere in-ter-fere | interrupt in-ter-rupt | language lan-guage | leisure lei-sure
lightning light-ning | marvellous mar-vel-lous | mischievous mis-chie-vous | muscle mus-cle
necessary nec-es-sar-y | neighbour neigh-bour | nuisance nui-sance | occupy oc-cu-py
occur oc-cur | opportunity op-por-tu-ni-ty | parliament par-lia-ment | persuade per-suade
physical phys-i-cal | prejudice prej-u-dice | privilege priv-i-lege | profession pro-fes-sion
programme pro-gramme | pronunciation pro-nun-ci-a-tion | queue queue | recognise rec-og-nise
recommend rec-om-mend | relevant rel-e-vant | restaurant res-tau-rant | rhyme rhyme
rhythm rhy-thm | sacrifice sac-ri-fice | secretary sec-re-tar-y | shoulder shoul-der
signature sig-na-ture | sincere sin-cere | sincerely sin-cere-ly | soldier sol-dier
stomach stom-ach | sufficient suf-fi-cient | suggest sug-gest | symbol sym-bol | system sys-tem
temperature tem-per-a-ture | thorough thor-ough | twelfth twelfth | variety va-ri-e-ty
vegetable veg-e-ta-ble | vehicle ve-hi-cle | yacht yacht
`;

export const SYLLABLES = Object.fromEntries(
  RAW.split(/[|\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((entry) => {
      const [word, split] = entry.split(/\s+/);
      return [word, split.split("-")];
    })
);

/** The word split into syllable chunks, e.g. "disappear" → ["dis", "ap", "pear"]. */
export const chunks = (word) => SYLLABLES[word] || [word];
