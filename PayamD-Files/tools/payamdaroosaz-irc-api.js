/* =============================================================================
   موتور API سامانه پیام داروساز — نسخه ۲ (پشتیبان IndexedDB، بدون سقف حجم)
   -----------------------------------------------------------------------------
   نسخه ۱ به سقف ~۵ مگابایتی localStorage خورد (QuotaExceededError) و حلقه مرد.
   نسخه ۲ نتایج را در IndexedDB ذخیره می‌کند (صدها مگابایت آزاد) و هنگام بارگذاری
   هرچه در localStorage مانده باشد را خودکار به IndexedDB مهاجرت می‌دهد.
   درخواست‌ها با هدر Authorization: Bearer <توکن لاگین> — بدون کپچا.

   بارگذاری در Console سایت (تب لاگین‌شده payamdaroosaz.com):
     fetch('https://raw.githubusercontent.com/mohammadzdbdi-maker/INTRACTIONS/arena/01a0c5ce-intractions/PayamD-Files/tools/payamdaroosaz-irc-api.js?v=2').then(r=>r.text()).then(t=>eval(t))

   فرمان‌ها:
     __psaRunIRC(limit?)   شروع/ادامهٔ حلقهٔ 34,731 کد IRC
     __psaRunGen(limit?)   حلقهٔ سریع 1,704 کد ژنریک جامانده
     __psaStatus()         گزارش پیشرفت
     __psaStop()           توقف ایمن
     __psaExportIRC()      دانلود CSV نتایج IRC
     __psaExportGen()      دانلود CSV نتایج ژنریک
     __psaResetIRC() / __psaResetGen()   پاک‌کردن کامل حافظهٔ پیشرفت
   ============================================================================= */
(function () {
  'use strict';

  var RAW_LIST = 'https://raw.githubusercontent.com/mohammadzdbdi-maker/INTRACTIONS/arena/01a0c5ce-intractions/PayamD-Files/data/teamtech_ircs.json';
  var RAW_CODES = 'https://raw.githubusercontent.com/mohammadzdbdi-maker/INTRACTIONS/arena/01a0c5ce-intractions/PayamD-Files/data/payam_codes.json';
  var RAW_SUPP = 'https://raw.githubusercontent.com/mohammadzdbdi-maker/INTRACTIONS/arena/01a0c5ce-intractions/PayamD-Files/data/teamtech_suppl_ircs.json';
  var RAW_SUPPNAME = 'https://raw.githubusercontent.com/mohammadzdbdi-maker/INTRACTIONS/arena/01a0c5ce-intractions/PayamD-Files/data/supp_name_search.json';
  var RAW_SUPPNAME2 = 'https://raw.githubusercontent.com/mohammadzdbdi-maker/INTRACTIONS/arena/01a0c5ce-intractions/PayamD-Files/data/supp_name_search2.json';
  var RAW_SUPPNAME3 = 'https://raw.githubusercontent.com/mohammadzdbdi-maker/INTRACTIONS/arena/01a0c5ce-intractions/PayamD-Files/data/supp_name_search3.json';
  var RAW_SUPPNAME4 = 'https://raw.githubusercontent.com/mohammadzdbdi-maker/INTRACTIONS/arena/01a0c5ce-intractions/PayamD-Files/data/supp_name_search4.json';
  var GEN1704 = ["9", "12", "15", "25", "28", "45", "57", "88", "91", "98", "105", "110", "112", "124", "135", "138", "181", "186", "187", "197", "199", "202", "204", "219", "228", "238", "260", "270", "302", "315", "316", "330", "344", "346", "364", "371", "382", "383", "384", "394", "396", "414", "415", "442", "450", "451", "452", "478", "486", "487", "491", "492", "500", "501", "505", "508", "514", "517", "530", "531", "534", "541", "542", "570", "578", "583", "597", "604", "612", "613", "616", "634", "661", "667", "700", "703", "704", "711", "719", "739", "740", "744", "768", "790", "796", "798", "801", "802", "828", "858", "865", "868", "869", "870", "871", "879", "890", "905", "916", "932", "933", "945", "949", "954", "955", "959", "960", "963", "964", "965", "986", "998", "1012", "1019", "1023", "1028", "1041", "1061", "1074", "1078", "1083", "1084", "1085", "1088", "1091", "1092", "1093", "1094", "1098", "1099", "1100", "1105", "1108", "1109", "1115", "1123", "1134", "1139", "1155", "1158", "1160", "1163", "1166", "1168", "1172", "1174", "1187", "1198", "1210", "1217", "1229", "1236", "1241", "1265", "1278", "1284", "1290", "1297", "1305", "1310", "1313", "1318", "1320", "1322", "1338", "1339", "1342", "1343", "1345", "1365", "1369", "1381", "1389", "1392", "1393", "1400", "1403", "1405", "1406", "1425", "1427", "1435", "1436", "1437", "1442", "1449", "1452", "1454", "1456", "1457", "1461", "1463", "1474", "1485", "1494", "1506", "1509", "1530", "1537", "1538", "1558", "1563", "1578", "1589", "1595", "1604", "1608", "1642", "1657", "1667", "1679", "1680", "1682", "1697", "1702", "1706", "1712", "1724", "1737", "1739", "1749", "1754", "1777", "1778", "1783", "1823", "1839", "1840", "1861", "1866", "1873", "1880", "1881", "1889", "1898", "1914", "1941", "1950", "1952", "1970", "1980", "1982", "1990", "1995", "1996", "2020", "2027", "2045", "2049", "2052", "2066", "2068", "2070", "2071", "2080", "2084", "2089", "2098", "2106", "2120", "2123", "2129", "2146", "2151", "2156", "2158", "2162", "2163", "2164", "2172", "2197", "2200", "2201", "2236", "2237", "2247", "2256", "2262", "2279", "2294", "2317", "2321", "2325", "2354", "2355", "2380", "2388", "2392", "2400", "2401", "2405", "2421", "2435", "2436", "2468", "2476", "2492", "2506", "2667", "2670", "2686", "2713", "2767", "2959", "3016", "3024", "3412", "3538", "3539", "3540", "3541", "3849", "4008", "4159", "4256", "4482", "4538", "4585", "4682", "4770", "4832", "4929", "4963", "4965", "5100", "5155", "5188", "5292", "5496", "5599", "5716", "5728", "5791", "5796", "5830", "5845", "5966", "5979", "6016", "6066", "6078", "6242", "6243", "6244", "6245", "6246", "6308", "6323", "6331", "6353", "6369", "6376", "6548", "6685", "6753", "6780", "6855", "6916", "6923", "6927", "7030", "7058", "7083", "7135", "7178", "7197", "7198", "7233", "7377", "7392", "7475", "7516", "7525", "7551", "7629", "7684", "7865", "7913", "8021", "8024", "8040", "8079", "8081", "8178", "8210", "8360", "8426", "8444", "8530", "8601", "8636", "8646", "8681", "8699", "8826", "8838", "8884", "8891", "8927", "9212", "9238", "9431", "9486", "9563", "9572", "9575", "9619", "9640", "9646", "9747", "9805", "9887", "9903", "9947", "9949", "10006", "10016", "10018", "10097", "10188", "10309", "10653", "10726", "10764", "10765", "10786", "10792", "11269", "11366", "11372", "11375", "11405", "11407", "11504", "11506", "11647", "11694", "11798", "11873", "11886", "11889", "11908", "11910", "12056", "12105", "12115", "12118", "12299", "12322", "12423", "12455", "12528", "12534", "12541", "12741", "12761", "12863", "13143", "13238", "13267", "13291", "13323", "13345", "13425", "13435", "13497", "13695", "13696", "13800", "13899", "13930", "13935", "14051", "14083", "14113", "14115", "14119", "14142", "14155", "14266", "14399", "14457", "14541", "14626", "14659", "14761", "15224", "15449", "15522", "15544", "15846", "15976", "15978", "16097", "16215", "16254", "16255", "16416", "16426", "16491", "16778", "17013", "17106", "17130", "17171", "17197", "17213", "17227", "17230", "17340", "17397", "17611", "17643", "17675", "17753", "17768", "17770", "17772", "17773", "17870", "17872", "17874", "17956", "18064", "18065", "18129", "18384", "18407", "18505", "18556", "18586", "18588", "18672", "18780", "18820", "18897", "18898", "18904", "18932", "18967", "19051", "19093", "19130", "19428", "19586", "19614", "19696", "19776", "19787", "19871", "19892", "19919", "19923", "19959", "20003", "20156", "20185", "20186", "20298", "20299", "20627", "20711", "20731", "20878", "20943", "21097", "21121", "21258", "21313", "21444", "21446", "21447", "21448", "21484", "21537", "21561", "21572", "21607", "21667", "21744", "21810", "21982", "22000", "22103", "22315", "22330", "22368", "22396", "22398", "22412", "22419", "22456", "22525", "22637", "22661", "22662", "22816", "22854", "22858", "23065", "23088", "23108", "23171", "23172", "23212", "23213", "23214", "23306", "23311", "23312", "23358", "23448", "23506", "23538", "23984", "24006", "24054", "24191", "24303", "24400", "24452", "24484", "24604", "24616", "24689", "24746", "25082", "25137", "50001", "50021", "50024", "50033", "50056", "50059", "50061", "50062", "50075", "50079", "50080", "50081", "50082", "50083", "50088", "50111", "50130", "50179", "50180", "50181", "50195", "50196", "50197", "50200", "50221", "50227", "50244", "50253", "50267", "50268", "50270", "50271", "50272", "50275", "50289", "50296", "50297", "50298", "50299", "50308", "50309", "50330", "50332", "50333", "50337", "50346", "50359", "50360", "50366", "50367", "50371", "50382", "50415", "50429", "50460", "50461", "50472", "50473", "50485", "50494", "50505", "50528", "50541", "50615", "50618", "50627", "50642", "50694", "50695", "50710", "50727", "50757", "50758", "50760", "50765", "50771", "50772", "50821", "50822", "50837", "50838", "50878", "50891", "50893", "50894", "50895", "50908", "50913", "50914", "50919", "50920", "50927", "50936", "50954", "50993", "51006", "51007", "51012", "51013", "51014", "51027", "51031", "51054", "51055", "51060", "51061", "51062", "51063", "51064", "51065", "51066", "51073", "51074", "51078", "51079", "51084", "51085", "51086", "51087", "51088", "51089", "51091", "51092", "51093", "51094", "51098", "51099", "51100", "51101", "51102", "51110", "51112", "51114", "51116", "51119", "51121", "51127", "51128", "51131", "51133", "51135", "51136", "51139", "51140", "51142", "51143", "51154", "51170", "51178", "51179", "51182", "51202", "51238", "51241", "51242", "51244", "51246", "51249", "51281", "51284", "51285", "51286", "51302", "51328", "51329", "51331", "51351", "51361", "51370", "51377", "51396", "51403", "51404", "51409", "51410", "51414", "51415", "51421", "51441", "51458", "51477", "51478", "51505", "51508", "51527", "51564", "51565", "51566", "51572", "51577", "51632", "51637", "51638", "51673", "51691", "51703", "51709", "51718", "51720", "51722", "51725", "51747", "51790", "51793", "51809", "51816", "51822", "51828", "51831", "51840", "51847", "51860", "51864", "51865", "51870", "51871", "51882", "51890", "51891", "51892", "51897", "51899", "51900", "51904", "51905", "51906", "51907", "51908", "51913", "51916", "51917", "51918", "51919", "51920", "51922", "51926", "51928", "51934", "51935", "51936", "51941", "51945", "51946", "51947", "51949", "51950", "51951", "51957", "51967", "51969", "51974", "51975", "51978", "51981", "51985", "51990", "51992", "51993", "51996", "51997", "51999", "52004", "52005", "52013", "52027", "52029", "52030", "52034", "52035", "52038", "52040", "52041", "52042", "52043", "52044", "52045", "52046", "52047", "52048", "52049", "52050", "52051", "52057", "52058", "52060", "52062", "52065", "52072", "52076", "52077", "52078", "52079", "52080", "52081", "52083", "52084", "52088", "52089", "52091", "52092", "52093", "52095", "52102", "52103", "52105", "52106", "52107", "52113", "52114", "52115", "52116", "52117", "52118", "52119", "52120", "52121", "52122", "52123", "52124", "52125", "52126", "52127", "52128", "52129", "52130", "52132", "52134", "52139", "52140", "52141", "52142", "52143", "52147", "52150", "52151", "52153", "52157", "52158", "52162", "52164", "52165", "52166", "52169", "52170", "52171", "52181", "52182", "52183", "52184", "52190", "52191", "52194", "52197", "52198", "52199", "52200", "52205", "52206", "52207", "52208", "52209", "52210", "52211", "52212", "52213", "52214", "52217", "52218", "52219", "52220", "52221", "52224", "52225", "52226", "52232", "52233", "52237", "52238", "52244", "52245", "52246", "52247", "52252", "52253", "52256", "52257", "52258", "52259", "52268", "52269", "52272", "52275", "52277", "52279", "52280", "52281", "52282", "52283", "52284", "52286", "52287", "52290", "52293", "52297", "52300", "52302", "52304", "52305", "52308", "52309", "52310", "52311", "52312", "52315", "52316", "52317", "52329", "52330", "52334", "52335", "52337", "52346", "52347", "52350", "52353", "52354", "52355", "52356", "52357", "52360", "52361", "52364", "52365", "52367", "52376", "52377", "52383", "52393", "52394", "52395", "52398", "52399", "52407", "52408", "52409", "52411", "52412", "52413", "52414", "52418", "52420", "52421", "52427", "52428", "52429", "52433", "52450", "52461", "52463", "52464", "52465", "52467", "52470", "52471", "52478", "52479", "52481", "52493", "52506", "52507", "52509", "52510", "52513", "52514", "52515", "52516", "52517", "52518", "52519", "52520", "52521", "52522", "52523", "52529", "52537", "52538", "52542", "52543", "52544", "52605", "52621", "52623", "52624", "52627", "52630", "52631", "52634", "52639", "52640", "52641", "52642", "52643", "52644", "52645", "52648", "52651", "52652", "52653", "52656", "52657", "52658", "52659", "52660", "52668", "52675", "52677", "52684", "52688", "52690", "52698", "52699", "52703", "52704", "52706", "52708", "52710", "52713", "52715", "52716", "52717", "52718", "52720", "52737", "52738", "52739", "52740", "52741", "52748", "52750", "52752", "52763", "52765", "52768", "52769", "52771", "52773", "52774", "52775", "52776", "52778", "52779", "52784", "52786", "52788", "52789", "52790", "52791", "52796", "52800", "52803", "52804", "52806", "52814", "52816", "52821", "52823", "52826", "52827", "52828", "52838", "52843", "52847", "52848", "52849", "52850", "52856", "52857", "52858", "52861", "52867", "52870", "52872", "52873", "52874", "52875", "52883", "52884", "52888", "52893", "52895", "52896", "52897", "52898", "52900", "52901", "52904", "52905", "52907", "52909", "52910", "52912", "52913", "52914", "52915", "52919", "52920", "52922", "52923", "52926", "52927", "52928", "52929", "52930", "52931", "52935", "52937", "52939", "52942", "52944", "52945", "52948", "52950", "52951", "52956", "52957", "52962", "52964", "52965", "52966", "52967", "52968", "52972", "52976", "52977", "52979", "52980", "52981", "52982", "52983", "52984", "52988", "52996", "52997", "52998", "53002", "53003", "53004", "53010", "53017", "53020", "53021", "53022", "53023", "53024", "53026", "53027", "53028", "53029", "53030", "53036", "53037", "53040", "53042", "53043", "53044", "53045", "53051", "53052", "53053", "53055", "53056", "53057", "53059", "53060", "53061", "53069", "53070", "53071", "53072", "53073", "53074", "53076", "53077", "53079", "53080", "53083", "53084", "53085", "53090", "53091", "53092", "53094", "53095", "53097", "53099", "53102", "53107", "53108", "53109", "53112", "53114", "53115", "53122", "53123", "53124", "53125", "53126", "53127", "53128", "53136", "53137", "53138", "53143", "53145", "53146", "53147", "53148", "53154", "53155", "53156", "53160", "53161", "53164", "53165", "53166", "53171", "53181", "53187", "53189", "53193", "53194", "53201", "53202", "53203", "53204", "53205", "53206", "53207", "53209", "53210", "53214", "53216", "53217", "53218", "53219", "53220", "53221", "53224", "53230", "53231", "53244", "53245", "53254", "53255", "53258", "53259", "53266", "53267", "53269", "53270", "53274", "53276", "53278", "53280", "53281", "53287", "53288", "53289", "53305", "53306", "53309", "53310", "53311", "53313", "53314", "53317", "53318", "53319", "53320", "53321", "53322", "53325", "53329", "53330", "53332", "53338", "53340", "53343", "53344", "53347", "53348", "53351", "53363", "53369", "53375", "53377", "53378", "53386", "53387", "53389", "53390", "53391", "53392", "53393", "53394", "53395", "53398", "53399", "53401", "53403", "53404", "53405", "53406", "53407", "53411", "53412", "53413", "53414", "53415", "53418", "53419", "53427", "53428", "53430", "53431", "53432", "53433", "53434", "53435", "53436", "53437", "53438", "53439", "53441", "53444", "53445", "53449", "53453", "53454", "53456", "53457", "53458", "53465", "53466", "53467", "53469", "53471", "53474", "53475", "53477", "53478", "53479", "53480", "53481", "53484", "53485", "53487", "53489", "53498", "53503", "53505", "53511", "53514", "53516", "53517", "53518", "53519", "53521", "53522", "53525", "53526", "53527", "53530", "53531", "53532", "53534", "53535", "53536", "53537", "53538", "53541", "53542", "53543", "53544", "53545", "53546", "53547", "53548", "53549", "53550", "53551", "53552", "53553", "53554", "53555", "53556", "53557", "53558", "53559", "53560", "53561", "53567", "53569", "53571", "53572", "53573", "53574", "53577", "53578", "53579", "53584", "53586", "53587", "53588", "53589", "53590", "53591", "53592", "53594", "53599", "53601", "53602", "53603", "53604", "53605", "53607", "53609", "53610", "53611", "53612", "53613", "53614", "53615", "53616", "53617", "53618", "53619", "53620", "53621", "53622", "53623", "53624", "53625", "53626", "53628", "53629", "53630", "53631", "53632", "53633", "53634", "53635", "53643", "53650", "53651", "53653", "53654", "53655", "53656", "53657", "53658", "53660", "53661", "53662", "53663", "53664", "53665", "53666", "53667", "53668", "53669", "53670", "53671", "53672", "53674", "53675", "53676", "53677", "53678", "53680", "53681", "53682", "53683", "53684", "53685", "53686", "53687", "53688", "53689", "53690", "53693", "53696", "53697", "53698", "53700", "53701", "53704", "53705", "53706", "53707", "53708", "53709", "53710", "53711", "53712", "53713", "53714", "53715", "53716", "53717", "53718", "53720", "53721", "53722", "53723", "53727", "53728", "53729", "53730", "53731", "53738", "53739", "53740", "53742", "53743", "53745", "53746", "53747", "53748", "53749", "53753", "53754", "53755", "53756", "53758", "53764", "53770", "53772", "53773", "53774", "53777", "53778", "53779", "53786", "53787", "60080", "66661", "66669", "92207", "98196", "99870", "99880", "99882", "99892", "99899", "99946", "99947", "99966", "99984", "99989", "370011", "500986", "630299", "970095", "1007172", "2564646", "4998000", "6260000", "6764634", "62602127", "62627073", "62627209", "62627923", "62679274", "62687021", "86902457"];

  var LS_IRC = '__psa_irc_v1';
  var LS_GEN = '__psa_gen_v1';
  var CONC = 3;
  var GAP_MS = 350;
  var BACKOFF_MS = 45000;
  var MAX_STRIKES = 4;

  window.__PSA = window.__PSA || {};
  var PSA = window.__PSA;
  PSA.ircs = null;
  PSA.running = false;
  PSA.stopReq = false;
  PSA.mem = { irc: null, gen: null };
  PSA.stats = { done: 0, found: 0, notfound: 0, multi: 0, errs: 0, strikes: 0 };

  function log(m) { console.log('[PSA] ' + m); }

  /* ---------------- لایه IndexedDB ---------------- */
  var DBP = null;
  function db() {
    if (DBP) return DBP;
    DBP = new Promise(function (res, rej) {
      var rq = indexedDB.open('psa_db', 8);
      rq.onupgradeneeded = function () {
        var d = rq.result;
        if (!d.objectStoreNames.contains('irc')) d.createObjectStore('irc', { keyPath: 'k' });
        if (!d.objectStoreNames.contains('gen')) d.createObjectStore('gen', { keyPath: 'k' });
        if (!d.objectStoreNames.contains('price')) d.createObjectStore('price', { keyPath: 'k' });
        if (!d.objectStoreNames.contains('supp')) d.createObjectStore('supp', { keyPath: 'k' });
        if (!d.objectStoreNames.contains('suppname')) d.createObjectStore('suppname', { keyPath: 'k' });
        if (!d.objectStoreNames.contains('suppname2')) d.createObjectStore('suppname2', { keyPath: 'k' });
        if (!d.objectStoreNames.contains('suppname3')) d.createObjectStore('suppname3', { keyPath: 'k' });
        if (!d.objectStoreNames.contains('suppname4')) d.createObjectStore('suppname4', { keyPath: 'k' });
        if (!d.objectStoreNames.contains('catalog')) d.createObjectStore('catalog', { keyPath: 'k' });
        if (!d.objectStoreNames.contains('catq')) d.createObjectStore('catq', { keyPath: 'k' });
      };
      rq.onsuccess = function () { res(rq.result); };
      rq.onerror = function () { rej(rq.error); };
    });
    return DBP;
  }
  function tx(store, mode, fn) {
    return db().then(function (d) {
      return new Promise(function (res, rej) {
        var t = d.transaction(store, mode);
        var s = t.objectStore(store);
        var rq = fn(s);
        t.oncomplete = function () { res(rq ? rq.result : undefined); };
        t.onerror = function () { rej(t.error); };
        t.onabort = function () { rej(t.error); };
      });
    });
  }
  function getAll(store) { return tx(store, 'readonly', function (s) { return s.getAll(); }); }
  function putMany(store, entries) {
    if (!entries || !entries.length) return Promise.resolve();
    return tx(store, 'readwrite', function (s) { entries.forEach(function (e) { s.put(e); }); });
  }
  function clearStore(store) { return tx(store, 'readwrite', function (s) { return s.clear(); }); }
  function countStore(store) { return tx(store, 'readonly', function (s) { return s.count(); }); }
  function toMap(arr) { var m = {}; (arr || []).forEach(function (e) { m[e.k] = e; }); return m; }

  /* ---------------- مهاجرت از localStorage ---------------- */
  function migrate() {
    [[ 'irc', LS_IRC ], [ 'gen', LS_GEN ]].forEach(function (pair) {
      var raw = null;
      try { raw = localStorage.getItem(pair[1]); } catch (e) {}
      if (!raw) return;
      var obj = null;
      try { obj = JSON.parse(raw); } catch (e) { return; }
      var entries = Object.keys(obj).map(function (k) { var e = obj[k]; e.k = k; return e; });
      if (!entries.length) { localStorage.removeItem(pair[1]); return; }
      putMany(pair[0], entries).then(function () {
        try { localStorage.removeItem(pair[1]); } catch (e) {}
        log('MIGRATED ' + entries.length + ' رکورد از localStorage به IndexedDB (استور ' + pair[0] + ')');
      }).catch(function (e) { log('خطای مهاجرت ' + pair[1] + ': ' + e); });
    });
  }

  /* ---------------- احراز هویت و جستجو ---------------- */
  function authTok() {
    try {
      var a = JSON.parse(localStorage.getItem('ls.authorizationData') || 'null');
      if (typeof a === 'string') return a;
      if (a && typeof a === 'object') return a.token || a.access_token || a.id || '';
    } catch (e) {}
    return '';
  }
  function isWafText(t) { return /آروان|arvan|challenge|دسترسی شما مسدود|captcha-cloud|<html/i.test(t || ''); }
  function pad5(s) { s = String(s); return s.length < 5 ? ('00000' + s).slice(-5) : s; }

  function search(kw) {
    var tok = authTok();
    if (!tok) return Promise.resolve({ status: 401, json: null, text: 'NO_LOCAL_TOKEN' });
    var url = '/api/v3/frontOffice/products?keyword=' + encodeURIComponent(kw) + '&page=1&pageSize=10';
    return fetch(url, { headers: { 'accept': 'application/json', 'Authorization': 'Bearer ' + tok } })
      .then(function (r) {
        return r.text().then(function (t) {
          var j = null; try { j = JSON.parse(t); } catch (e) {}
          return { status: r.status, json: j, text: t };
        });
      })
      .catch(function (e) { return { status: 0, json: null, text: String(e) }; });
  }

  function pickIRC(json) {
    var items = (json && json.items) || [];
    var total = (json && json.total) || items.length;
    var prods = items.filter(function (i) { return !i.isGeneric; });
    var pick = prods.length ? prods : items;
    if (!pick.length) return { st: 'notfound', n: total };
    var first = pick[0];
    var all = pick.map(function (i) { return i.payamCode || ''; }).join(';');
    return {
      st: prods.length > 1 ? 'multi' : 'ok',
      n: total,
      p: first.payamCode || '',
      f: (first.fullNameFa || '').trim(),
      e: (first.fullNameEn || '').trim(),
      id: first.id,
      all: prods.length > 1 ? all : ''
    };
  }
  function pickGen(json) {
    var items = (json && json.items) || [];
    var total = (json && json.total) || items.length;
    var g = null;
    for (var i = 0; i < items.length; i++) if (items[i].isGeneric) { g = items[i]; break; }
    var prods = items.filter(function (x) { return !x.isGeneric; });
    if (!g && !prods.length) return { st: 'notfound', n: total };
    return {
      st: g ? 'ok' : 'prodonly',
      n: total,
      gp: g ? (g.payamCode || '') : '',
      gf: g ? (g.fullNameFa || '').trim() : '',
      fp: prods.length ? (prods[0].payamCode || '') : '',
      ff: prods.length ? (prods[0].fullNameFa || '').trim() : ''
    };
  }

  function pickPrice(json, kw) {
    var items = (json && json.items) || [];
    var it = null;
    for (var i = 0; i < items.length; i++) if (items[i].payamCode === kw) { it = items[i]; break; }
    if (!it) return { st: 'notfound' };
    var lp = it.latestPrice || null;
    return {
      st: (lp && lp.price != null) ? 'ok' : 'noprice',
      pr: (lp && lp.price != null) ? lp.price : '',
      ut: lp ? (lp.updateTime || '') : '',
      f: (it.fullNameFa || '').trim()
    };
  }

  function pickSupp(json, kw) {
    var items = (json && json.items) || [];
    var total = (json && json.total) || items.length;
    var prods = items.filter(function (i) { return !i.isGeneric; });
    var pick = prods.length ? prods : items;
    if (!pick.length) return { st: 'notfound', n: total };
    var first = pick[0];
    var lp = first.latestPrice || null;
    var all = pick.map(function (i) { return i.payamCode || ''; }).join(';');
    return {
      st: prods.length > 1 ? 'multi' : 'ok',
      n: total,
      p: first.payamCode || '',
      f: (first.fullNameFa || '').trim(),
      e: (first.fullNameEn || '').trim(),
      id: first.id,
      pr: (lp && lp.price != null) ? lp.price : '',
      ut: lp ? (lp.updateTime || '') : '',
      all: prods.length > 1 ? all : ''
    };
  }

  /* ---------------- حلقهٔ اجرا ---------------- */
  function runQueue(list, store, picker, opts) {
    if (PSA.running) { log('یک حلقه در حال اجراست؛ اول __psaStop()'); return; }
    PSA.running = true; PSA.stopReq = false;
    PSA.stats = { done: 0, found: 0, notfound: 0, multi: 0, errs: 0, strikes: 0 };
    var stopped = null;

    getAll(store).then(function (arr) {
      var state = toMap(arr);
      PSA.mem[store] = state;
      var todo = list.filter(function (k) { return !state[k]; });
      var limit = (opts && opts.limit) || todo.length;
      todo = todo.slice(0, limit);
      if (!todo.length) {
        PSA.running = false;
        log('همهٔ موارد پردازش شده‌اند (' + Object.keys(state).length + '/' + list.length + '). خروجی: __psaExport…');
        return;
      }
      var idx = 0, dirty = [];
      log('شروع: ' + todo.length + ' مورد مانده از ' + list.length + ' (ذخیرهٔ فعلی: ' + Object.keys(state).length + ')');

      function flush() {
        var batch = dirty.splice(0, dirty.length);
        return putMany(store, batch).catch(function (e) { log('هشدار ذخیره‌سازی: ' + e); });
      }

      function finish(msg) {
        flush().then(function () {
          PSA.running = false;
          log('پایان/توقف: ' + (msg || 'تکمیل شد') + ' | این دور: ' + PSA.stats.done +
              ' یافت:' + PSA.stats.found + ' نیافت:' + PSA.stats.notfound + ' چندنتیجه:' + PSA.stats.multi + ' خطا:' + PSA.stats.errs +
              ' | ذخیرهٔ کل: ' + Object.keys(state).length + '/' + list.length);
          log('ادامه: همان فرمان دوباره. خروجی: __psaExport…');
        });
      }

      function worker() {
        return (function next() {
          if (PSA.stopReq) { stopped = 'درخواست توقف'; return Promise.resolve(); }
          if (PSA.stats.strikes >= MAX_STRIKES) { stopped = 'خطای پیاپی (WAF/نرخ/توکن)'; return Promise.resolve(); }
          var my = idx++;
          if (my >= todo.length) return Promise.resolve();
          var kw = todo[my];
          return new Promise(function (res) { setTimeout(res, GAP_MS); })
            .then(function () { return search(opts.kwOf ? opts.kwOf(kw) : (opts.pad ? pad5(kw) : kw)); })
            .then(function (r) {
              if (r.status === 200 && r.json) {
                var rec = picker(r.json, kw);
                rec.k = kw;
                state[kw] = rec; dirty.push(rec);
                PSA.stats.done++;
                if (rec.st === 'notfound') PSA.stats.notfound++;
                else if (rec.st === 'multi') PSA.stats.multi++;
                else PSA.stats.found++;
                PSA.stats.strikes = 0;
              } else if (r.status === 401 || r.status === 403) {
                PSA.stats.strikes = MAX_STRIKES;
                stopped = 'توکن لاگین معتبر نیست (401/403)؛ دوباره لاگین کنید و ادامه دهید';
              } else if (r.status === 400) {
                PSA.stats.strikes = MAX_STRIKES;
                stopped = 'خطای 400 (کپچا/216)؛ یک جستجوی دستی بکنید و ادامه دهید';
              } else if (r.status === 429 || r.status === 503 || r.status === 0 || isWafText(r.text)) {
                PSA.stats.strikes++; PSA.stats.errs++;
                log('مکث احتیاطی (' + PSA.stats.strikes + '/' + MAX_STRIKES + ') پس از خطای ' + r.status);
                return new Promise(function (res) { setTimeout(res, BACKOFF_MS); });
              } else {
                var er = { st: 'err', code: r.status, k: kw };
                state[kw] = er; dirty.push(er);
                PSA.stats.done++; PSA.stats.errs++;
              }
              if (PSA.stats.done % 100 === 0) {
                log('پیشرفت: ' + PSA.stats.done + '/' + todo.length + ' (کل ذخیره: ' + Object.keys(state).length + '/' + list.length + ')' +
                    ' یافت:' + PSA.stats.found + ' نیافت:' + PSA.stats.notfound + ' خطا:' + PSA.stats.errs);
              }
              if (dirty.length >= 25) return flush().then(function () { return next(); });
              return next();
            });
        })();
      }

      var ws = [];
      for (var w = 0; w < CONC; w++) ws.push(worker());
      Promise.all(ws).then(function () { finish(stopped); });
    }).catch(function (e) {
      PSA.running = false;
      log('خطای IndexedDB: ' + e);
    });
  }

  /* ---------------- خروجی CSV ---------------- */
  function csvDownload(filename, rows) {
    var csv = '\uFEFF' + rows.map(function (r) {
      return r.map(function (c) {
        c = (c == null ? '' : String(c));
        if (!/^=".*"$/.test(c) && /[",\r\n]/.test(c)) c = '"' + c.replace(/"/g, '""') + '"';
        return c;
      }).join(',');
    }).join('\r\n');
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
    log('فایل ' + filename + ' دانلود شد (' + (rows.length - 1) + ' ردیف)');
  }
  function z(v) { return v ? '="' + v + '"' : ''; }

  function stateMap(store) {
    if (PSA.mem[store]) return Promise.resolve(PSA.mem[store]);
    return getAll(store).then(toMap);
  }

  /* ---------------- فرمان‌ها ---------------- */
  function ensureList(cb) {
    if (PSA.ircs) { cb(PSA.ircs); return; }
    log('در حال دانلود لیست IRC از گیت‌هاب…');
    fetch(RAW_LIST).then(function (r) { return r.json(); }).then(function (j) {
      PSA.ircs = j; log('LIST READY: ' + j.length + ' کد IRC. حالا: __psaRunIRC()');
      cb(j);
    }).catch(function (e) { log('خطا در دانلود لیست: ' + e); });
  }

  window.__psaRunIRC = function (limit) { ensureList(function (list) { runQueue(list, 'irc', pickIRC, { limit: limit }); }); };
  window.__psaRunGen = function (limit) { runQueue(GEN1704, 'gen', pickGen, { limit: limit, pad: true }); };

  window.__psaExportIRC = function () {
    ensureList(function (list) {
      stateMap('irc').then(function (st) {
        var rows = [['کد IRC', 'کد پیام', 'نام فارسی', 'نام انگلیسی', 'تعداد نتایج', 'وضعیت', 'همه کدهای پیام']];
        list.forEach(function (k) {
          var r = st[k];
          if (!r) { rows.push([k, '', '', '', '', 'pending', '']); return; }
          rows.push([k, z(r.p), r.f || '', r.e || '', r.n == null ? '' : r.n, r.st, r.all || '']);
        });
        csvDownload('payam_irc_results.csv', rows);
      });
    });
  };
  window.__psaExportGen = function () {
    stateMap('gen').then(function (st) {
      var rows = [['کد ژنریک', 'پیدا شد', 'کد پیام (سطح ژنریک)', 'نام ژنریک', 'تعداد فرآورده', 'کد پیام نخستین فرآورده', 'نام نخستین فرآورده', 'وضعیت']];
      GEN1704.forEach(function (k) {
        var r = st[k];
        if (!r) { rows.push([k, '', '', '', '', '', '', 'pending']); return; }
        rows.push([k, r.st === 'notfound' ? 'خیر' : 'بله', z(r.gp), r.gf || '', r.n == null ? '' : r.n, z(r.fp), r.ff || '', r.st]);
      });
      csvDownload('payam_gen_results.csv', rows);
    });
  };

  window.__psaStop = function () { PSA.stopReq = true; log('درخواست توقف؛ چند ثانیه…'); };
  window.__psaStatus = function () {
    Promise.all([countStore('irc'), countStore('gen'), countStore('price'), countStore('supp'), countStore('catalog'), countStore('catq')]).then(function (c) {
      log('IRC ذخیره‌شده: ' + c[0] + (PSA.ircs ? '/' + PSA.ircs.length : '/?') +
          ' | مکمل ذخیره‌شده: ' + c[3] + (PSA.supp ? '/' + PSA.supp.length : '/?') +
          ' | ژنریک ذخیره‌شده: ' + c[1] + '/' + GEN1704.length +
          ' | قیمت ذخیره‌شده: ' + c[2] + (PSA.codes ? '/' + PSA.codes.length : '/?') +
          ' | کاتالوگ: ' + c[4] + ' محصول، ' + c[5] + ' گره' +
          ' | در حال اجرا: ' + (PSA.running ? 'بله' : 'خیر'));
    });
  };
  window.__psaResetIRC = function () { PSA.mem.irc = null; clearStore('irc').then(function () { log('استور irc پاک شد'); }); };
  window.__psaResetGen = function () { PSA.mem.gen = null; clearStore('gen').then(function () { log('استور gen پاک شد'); }); };

  /* ---------------- حالت قیمت روز (latestPrice سایت) ---------------- */
  function ensureCodes(cb) {
    if (PSA.codes) { cb(PSA.codes); return; }
    log('در حال دانلود لیست کدهای پیام از گیت‌هاب…');
    fetch(RAW_CODES).then(function (r) { return r.json(); }).then(function (j) {
      PSA.codes = j; log('CODES READY: ' + j.length + ' کد پیام. حالا: __psaRunPrice()');
      cb(j);
    }).catch(function (e) { log('خطا در دانلود لیست کدها: ' + e); });
  }
  window.__psaRunPrice = function (limit) { ensureCodes(function (list) { runQueue(list, 'price', pickPrice, { limit: limit }); }); };
  window.__psaExportPrice = function () {
    ensureCodes(function (list) {
      stateMap('price').then(function (st) {
        var rows = [['کد پیام', 'قیمت واحد فعلی (ریال)', 'تاریخ به‌روزرسانی (میلادی)', 'نام فارسی', 'وضعیت']];
        list.forEach(function (k) {
          var r = st[k];
          if (!r) { rows.push([k, '', '', '', 'pending']); return; }
          rows.push([k, r.pr == null ? '' : r.pr, r.ut || '', r.f || '', r.st]);
        });
        csvDownload('payam_price_results.csv', rows);
      });
    });
  };
  window.__psaResetPrice = function () { PSA.mem.price = null; clearStore('price').then(function () { log('استور price پاک شد'); }); };

  function pickCands(json, kw) {
    var items = (json && json.items) || [];
    return {
      n: (json && json.total) || items.length,
      it: items.slice(0, 10).map(function (i) {
        var lp = i.latestPrice || null;
        return { p: i.payamCode || '', f: (i.fullNameFa || '').trim(), e: (i.fullNameEn || '').trim(), g: i.genericCode5 || '', ic: i.irc || '', pr: (lp && lp.price != null) ? lp.price : '', ut: lp ? (lp.updateTime || '') : '' };
      })
    };
  }

  /* ---------------- حالت مکمل‌ها (IRC + کد پیام + قیمت در یک پاس) ---------------- */
  function ensureSupp(cb) {
    if (PSA.supp) { cb(PSA.supp); return; }
    log('در حال دانلود لیست IRC مکمل‌ها از گیت‌هاب…');
    fetch(RAW_SUPP).then(function (r) { return r.json(); }).then(function (j) {
      PSA.supp = j; log('SUPP LIST READY: ' + j.length + ' کد IRC مکمل. حالا: __psaRunSupp()');
      cb(j);
    }).catch(function (e) { log('خطا در دانلود لیست مکمل: ' + e); });
  }
  window.__psaRunSupp = function (limit) { ensureSupp(function (list) { runQueue(list, 'supp', pickSupp, { limit: limit }); }); };
  window.__psaExportSupp = function () {
    ensureSupp(function (list) {
      stateMap('supp').then(function (st) {
        var rows = [['کد IRC', 'کد پیام', 'نام فارسی', 'نام انگلیسی', 'تعداد نتایج', 'وضعیت', 'قیمت واحد فعلی (ریال)', 'تاریخ به‌روزرسانی (میلادی)', 'همه کدهای پیام']];
        list.forEach(function (k) {
          var r = st[k];
          if (!r) { rows.push([k, '', '', '', '', 'pending', '', '', '']); return; }
          rows.push([k, z(r.p), r.f || '', r.e || '', r.n == null ? '' : r.n, r.st, r.pr == null ? '' : r.pr, r.ut || '', r.all || '']);
        });
        csvDownload('payam_supp_results.csv', rows);
      });
    });
  };
  window.__psaResetSupp = function () { PSA.mem.supp = null; clearStore('supp').then(function () { log('استور supp پاک شد'); }); };

  /* ---------------- حالت جستجوی نام برای مکمل‌های بدون IRC ---------------- */
  function ensurePairs(cb) {
    if (PSA.pairs) { cb(PSA.pairs); return; }
    log('در حال دانلود لیست جستجوی نام مکمل‌ها…');
    fetch(RAW_SUPPNAME).then(function (r) { return r.json(); }).then(function (j) {
      PSA.pairs = j; log('NAME LIST READY: ' + j.length + ' ردیف. حالا: __psaRunSuppName()');
      cb(j);
    }).catch(function (e) { log('خطا در دانلود لیست نام: ' + e); });
  }
  window.__psaRunSuppName = function (limit) {
    ensurePairs(function (pairs) {
      var keys = pairs.map(function (x) { return x[0]; });
      PSA.pairMap = {}; pairs.forEach(function (x) { PSA.pairMap[x[0]] = x[1]; });
      runQueue(keys, 'suppname', function (json, kw) { return pickCands(json, PSA.pairMap[kw] || kw); }, { limit: limit, kwOf: function (k) { return PSA.pairMap[k] || k; } });
    });
  };
  window.__psaExportSuppName = function () {
    ensurePairs(function (pairs) {
      stateMap('suppname').then(function (st) {
        var rows = [['کد IRC', 'کلمه جستجو', 'تعداد نتایج', 'کد پیام کاندیدا', 'نام فارسی کاندیدا', 'نام انگلیسی کاندیدا', 'کد ژنریک کاندیدا', 'IRC کاندیدا', 'قیمت کاندیدا (ریال)', 'تاریخ قیمت (میلادی)']];
        pairs.forEach(function (x) {
          var irc = x[0], kw = x[1], r = st[irc];
          if (!r) { rows.push([irc, kw, 'pending', '', '', '', '', '', '', '']); return; }
          if (!r.it || !r.it.length) { rows.push([irc, kw, r.n, '', '', '', '', '', '', '']); return; }
          r.it.forEach(function (c) { rows.push([irc, kw, r.n, c.p, c.f, c.e, c.g, c.ic, c.pr == null ? '' : c.pr, c.ut || '']); });
        });
        csvDownload('payam_suppname_results.csv', rows);
      });
    });
  };
  window.__psaResetSuppName = function () { PSA.mem.suppname = null; clearStore('suppname').then(function () { log('استور suppname پاک شد'); }); };


  /* ---------------- پاس نام ۲: کلمهٔ برند متمایز برای صفرنتیجه‌های پاس ۱ ---------------- */
  function ensurePairs2(cb) {
    if (PSA.pairs2) { cb(PSA.pairs2); return; }
    log('در حال دانلود لیست نام پاس ۲…');
    fetch(RAW_SUPPNAME2).then(function (r) { return r.json(); }).then(function (j) {
      PSA.pairs2 = j; log('NAME2 LIST READY: ' + j.length + ' ردیف. حالا: __psaRunSuppName2()');
      cb(j);
    }).catch(function (e) { log('خطا در دانلود لیست نام۲: ' + e); });
  }
  window.__psaRunSuppName2 = function (limit) {
    ensurePairs2(function (pairs) {
      var keys = pairs.map(function (x) { return x[0]; });
      PSA.pairMap2 = {}; pairs.forEach(function (x) { PSA.pairMap2[x[0]] = x[1]; });
      runQueue(keys, 'suppname2', function (json, kw) { return pickCands(json, PSA.pairMap2[kw] || kw); }, { limit: limit, kwOf: function (k) { return PSA.pairMap2[k] || k; } });
    });
  };
  window.__psaExportSuppName2 = function () {
    ensurePairs2(function (pairs) {
      stateMap('suppname2').then(function (st) {
        var rows = [['کد IRC', 'کلمه جستجو', 'تعداد نتایج', 'کد پیام کاندیدا', 'نام فارسی کاندیدا', 'نام انگلیسی کاندیدا', 'کد ژنریک کاندیدا', 'IRC کاندیدا', 'قیمت کاندیدا (ریال)', 'تاریخ قیمت (میلادی)']];
        pairs.forEach(function (x) {
          var irc = x[0], kw = x[1], r = st[irc];
          if (!r) { rows.push([irc, kw, 'pending', '', '', '', '', '', '', '']); return; }
          if (!r.it || !r.it.length) { rows.push([irc, kw, r.n, '', '', '', '', '', '', '']); return; }
          r.it.forEach(function (c) { rows.push([irc, kw, r.n, c.p, c.f, c.e, c.g, c.ic, c.pr == null ? '' : c.pr, c.ut || '']); });
        });
        csvDownload('payam_suppname2_results.csv', rows);
      });
    });
  };

  /* ---------------- پاس نام ۳: کلمهٔ اول متمایز برند ---------------- */
  function ensurePairs3(cb) {
    if (PSA.pairs3) { cb(PSA.pairs3); return; }
    log('در حال دانلود لیست نام پاس ۳…');
    fetch(RAW_SUPPNAME3).then(function (r) { return r.json(); }).then(function (j) {
      PSA.pairs3 = j; log('NAME3 LIST READY: ' + j.length + ' ردیف. حالا: __psaRunSuppName3()');
      cb(j);
    }).catch(function (e) { log('خطا در دانلود لیست نام۳: ' + e); });
  }
  window.__psaRunSuppName3 = function (limit) {
    ensurePairs3(function (pairs) {
      var keys = pairs.map(function (x) { return x[0]; });
      PSA.pairMap3 = {}; pairs.forEach(function (x) { PSA.pairMap3[x[0]] = x[1]; });
      runQueue(keys, 'suppname3', function (json, kw) { return pickCands(json, PSA.pairMap3[kw] || kw); }, { limit: limit, kwOf: function (k) { return PSA.pairMap3[k] || k; } });
    });
  };
  window.__psaExportSuppName3 = function () {
    ensurePairs3(function (pairs) {
      stateMap('suppname3').then(function (st) {
        var rows = [['کد IRC', 'کلمه جستجو', 'تعداد نتایج', 'کد پیام کاندیدا', 'نام فارسی کاندیدا', 'نام انگلیسی کاندیدا', 'کد ژنریک کاندیدا', 'IRC کاندیدا', 'قیمت کاندیدا (ریال)', 'تاریخ قیمت (میلادی)']];
        pairs.forEach(function (x) {
          var irc = x[0], kw = x[1], r = st[irc];
          if (!r) { rows.push([irc, kw, 'pending', '', '', '', '', '', '', '']); return; }
          if (!r.it || !r.it.length) { rows.push([irc, kw, r.n, '', '', '', '', '', '', '']); return; }
          r.it.forEach(function (c) { rows.push([irc, kw, r.n, c.p, c.f, c.e, c.g, c.ic, c.pr == null ? '' : c.pr, c.ut || '']); });
        });
        csvDownload('payam_suppname3_results.csv', rows);
      });
    });
  };

  /* ---------------- پروب: آیا لیست کامل بدون کلمه کلید ممکن است؟ ---------------- */
  window.__psaProbeAll = function () {
    var tok = authTok();
    if (!tok) { log('توکن محلی نیست؛ اول وارد سایت شوید'); return; }
    var tries = [
      ['بدون پارامتر keyword', '/api/v3/frontOffice/products?page=1&pageSize=10'],
      ['keyword خالی', '/api/v3/frontOffice/products?keyword=&page=1&pageSize=10'],
      ['keyword=%20 (فاصله)', '/api/v3/frontOffice/products?keyword=%20&page=1&pageSize=10'],
      ['pageSize=50 بدون keyword', '/api/v3/frontOffice/products?page=1&pageSize=50'],
      ['pageSize=100 بدون keyword', '/api/v3/frontOffice/products?page=1&pageSize=100'],
      ['page=2 بدون keyword', '/api/v3/frontOffice/products?page=2&pageSize=10'],
      ['keyword=0', '/api/v3/frontOffice/products?keyword=0&page=1&pageSize=10'],
      ['keyword=آ', '/api/v3/frontOffice/products?keyword=' + encodeURIComponent('آ') + '&page=1&pageSize=10']
    ];
    tries.reduce(function (pr, t) {
      return pr.then(function () {
        return fetch(t[1], { headers: { 'accept': 'application/json', 'Authorization': 'Bearer ' + tok } })
          .then(function (r) { return r.text().then(function (x) { return { st: r.status, x: x }; }); })
          .then(function (res) {
            var j = null; try { j = JSON.parse(res.x); } catch (e) {}
            var total = j && (j.total != null) ? j.total : '-';
            var cnt = j && j.items ? j.items.length : '-';
            var first = (j && j.items && j.items[0]) ? (j.items[0].fullNameFa || j.items[0].payamCode || '') : '';
            var waf = !j && isWafText(res.x) ? ' (WAF/HTML!)' : '';
            log('PROBE [' + t[0] + '] status=' + res.st + ' total=' + total + ' items=' + cnt + ' first=' + String(first).slice(0, 50) + waf);
          })
          .catch(function (e) { log('PROBE [' + t[0] + '] ERR ' + e); })
          .then(function () { return new Promise(function (r2) { setTimeout(r2, 600); }); });
      });
    }, Promise.resolve()).then(function () { log('PROBE ALL DONE — خروجی را بفرستید'); });
  };

  /* ---------------- کاتالوگ کامل: پروب۲ + خزشگر پیشوند کد پیام ---------------- */
  function catFetch(kw, page, size) {
    var tok = authTok();
    if (!tok) return Promise.resolve({ status: 401, json: null, text: 'NO_TOKEN' });
    var url = '/api/v3/frontOffice/products?keyword=' + encodeURIComponent(kw) + '&page=' + page + '&pageSize=' + size;
    return fetch(url, { headers: { 'accept': 'application/json', 'Authorization': 'Bearer ' + tok } })
      .then(function (r) {
        return r.text().then(function (t) {
          var j = null; try { j = JSON.parse(t); } catch (e) {}
          return { status: r.status, json: j, text: t };
        });
      })
      .catch(function (e) { return { status: 0, json: null, text: String(e) }; });
  }
  function catSleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  window.__psaProbeAll2 = function () {
    var tries = [
      ['کد کامل پیگمادرم', '0301010272', 10],
      ['کد کامل لانتوس', '0100010466', 10],
      ['کد چرند (کنترل)', '99999999', 10],
      ['GTIN پیگمادرم', '6260661805558', 10],
      ['پیشوند ۸ رقمی', '03010102', 10],
      ['پیشوند ۶ رقمی', '030101', 10],
      ['پیشوند ۴ رقمی', '0301', 10],
      ['پیشوند ۲ رقمی', '03', 10],
      ['پیشوند ۴ رقمی pageSize=100', '0301', 100],
      ['keyword=0 pageSize=100', '0', 100]
    ];
    tries.reduce(function (pr, t) {
      return pr.then(function () {
        return catFetch(t[1], 1, t[2]).then(function (r) {
          var j = r.json;
          var total = j && j.total != null ? j.total : '-';
          var items = (j && j.items) || [];
          var f0 = items[0] || {};
          var hit = String(f0.payamCode || '').indexOf(t[1]) >= 0 || String(f0.irc || '').indexOf(t[1]) >= 0;
          log('PROBE2 [' + t[0] + '] kw=' + t[1] + ' size=' + t[2] + ' status=' + r.status + ' total=' + total +
              ' items=' + items.length + ' firstCode=' + (f0.payamCode || '') + ' firstFa=' + String(f0.fullNameFa || '').slice(0, 40) +
              ' codeHasKw=' + (hit ? 'YES' : 'no') + (!j && isWafText(r.text) ? ' (WAF!)' : ''));
        }).then(function () { return catSleep(700); });
      });
    }, Promise.resolve()).then(function () { log('PROBE2 DONE — خروجی را بفرستید'); });
  };


  window.__psaProbeAll3 = function () {
    var tries = [
      ['ژنریک تنها', '03016', 100],
      ['ژنریک + فرم (فاصله)', '03016 قرص', 100],
      ['فرم + ژنریک', 'قرص 03016', 100],
      ['ژنریک + عدد دوز', '03016 150', 100],
      ['نام تک‌کلمه', 'پیگمادرم', 100],
      ['نام دوکلمه AND?', 'پیگمادرم کپسول', 100]
    ];
    tries.reduce(function (pr, t) {
      return pr.then(function () {
        return catFetch(t[1], 1, t[2]).then(function (r) {
          var j = r.json;
          var items = (j && j.items) || [];
          var f0 = items[0] || {};
          log('PROBE3 [' + t[0] + '] kw=' + t[1] + ' status=' + r.status + ' total=' + (j && j.total != null ? j.total : '-') +
              ' items=' + items.length + ' firstCode=' + (f0.payamCode || '') + ' firstFa=' + String(f0.fullNameFa || '').slice(0, 40));
        }).then(function () { return catSleep(700); });
      });
    }, Promise.resolve()).then(function () { log('PROBE3 DONE — خروجی را بفرستید'); });
  };

  var CAT_CAP = 100;
  window.__psaRunCatalog = function (rootLen, pageSize) {
    rootLen = rootLen || 1;
    pageSize = pageSize || 100;
    if (PSA.running) { log('یک حلقه در حال اجراست؛ اول __psaStop()'); return; }
    PSA.running = true; PSA.stopReq = false;
    PSA.catRootLen = rootLen;
    var size = pageSize;
    var st = { nodes: 0, dropped: 0, errs: 0, strikes: 0, stuck: 0 };
    var catDirty = [], qDirty = [];

    function okItem(i, p) {
      return String(i.payamCode || '').indexOf(p) >= 0 || String(i.irc || '').indexOf(p) >= 0 || String(i.genericCode5 || '').indexOf(p) >= 0;
    }
    function flushCat() {
      var b = catDirty.splice(0, catDirty.length);
      var q = qDirty.splice(0, qDirty.length);
      return putMany('catalog', b).then(function () { return putMany('catq', q); })
        .catch(function (e) { log('هشدار ذخیره: ' + e); });
    }
    function collect(items, p) {
      var out = [];
      (items || []).forEach(function (i) {
        if (!okItem(i, p)) { st.dropped++; return; }
        var lp = i.latestPrice || null;
        out.push({
          k: 'c' + (i.payamCode || '') + '|' + (i.id || i.irc || ''),
          p: i.payamCode || '', f: (i.fullNameFa || '').trim(), e: (i.fullNameEn || '').trim(),
          g: i.genericCode5 || '', ic: i.irc || '', ig: i.isGeneric ? 1 : 0,
          pr: (lp && lp.price != null) ? lp.price : '', ut: lp ? (lp.updateTime || '') : ''
        });
      });
      catDirty.push.apply(catDirty, out);
      return out.length;
    }

    getAll('catq').then(function (arr) {
      var done = {}; arr.forEach(function (n) { done[n.k] = n; });
      function rebuild() {
        var q = [], seen = {};
        function push(p) { if (!done[p] && !seen[p]) { seen[p] = 1; q.push(p); } }
        var roots = Math.pow(10, rootLen);
        for (var i = 0; i < roots; i++) push(('000000000' + i).slice(-rootLen));
        Object.keys(done).forEach(function (k) {
          if (done[k].n >= CAT_CAP && k.length < 5) for (var d = 0; d <= 9; d++) push(k + d);
        });
        return q;
      }
      var queue = rebuild();
      var catCount = arr.reduce(function (a, n) { return a + (n.c || 0); }, 0);
      log('CATALOG شروع: ریشهٔ ' + rootLen + ' رقمی (فضای کد ژنریک، عمق تا ۵) | گرههای مانده: ' + queue.length + ' | تمام‌شده: ' + arr.length + ' | pageSize=' + size);
      var qidx = 0;

      function doPage(p, pg) {
        return catFetch(p, pg, size).then(function (r) {
          if (r.status !== 200 || !r.json) {
            if (size > 10 && (r.status === 400 || r.status === 422)) {
              log('CATALOG: pageSize=' + size + ' رد شد؛ کاهش به ۱۰');
              size = 10;
              return doPage(p, pg);
            }
            st.errs++; st.strikes++;
            if (st.strikes >= MAX_STRIKES) return 'FATAL';
            if (r.status === 429 || isWafText(r.text)) return catSleep(BACKOFF_MS).then(function () { return doPage(p, pg); });
            return catSleep(2000).then(function () { return doPage(p, pg); });
          }
          st.strikes = 0;
          return r.json;
        });
      }

      function doNode(p) {
        return doPage(p, 1).then(function (j) {
          if (j === 'FATAL') return 'FATAL';
          if (!j) return null;
          var total = j.total || 0;
          var c = collect(j.items, p);
          var pages = Math.min(Math.ceil(Math.min(total, CAT_CAP) / size), Math.ceil(CAT_CAP / size));
          var chain = Promise.resolve();
          for (var pg = 2; pg <= pages; pg++) {
            chain = chain.then(function (pg2) {
              return function () {
                if (PSA.stopReq) return Promise.resolve();
                return catSleep(GAP_MS).then(function () { return doPage(p, pg2); }).then(function (j2) {
                  if (j2 && j2 !== 'FATAL') c += collect(j2.items, p);
                });
              };
            }(pg));
          }
          return chain.then(function () {
            st.nodes++; catCount += c;
            qDirty.push({ k: p, n: total, c: c });
            done[p] = { k: p, n: total, c: c };
            if (total >= CAT_CAP && p.length >= 5) { st.stuck++; log('CATALOG: ژنریک ' + p + ' روی سقف ۱۰۰ گیر کرد (بررسی دستی بعدی)'); }
            if (st.nodes % 25 === 0 || queue.length - qidx < 5) {
              log('CATALOG: گره ' + st.nodes + ' | صف مانده ' + (queue.length - qidx) + ' | رکورد جمع‌شده ~' + catCount + ' | حذف ' + st.dropped + ' | خطا ' + st.errs);
            }
            if (catDirty.length > 200) return flushCat();
            return null;
          });
        });
      }

      function worker() {
        return (function next() {
          if (PSA.stopReq) return Promise.resolve('STOP');
          var my = qidx++;
          if (my >= queue.length) return Promise.resolve();
          return catSleep(GAP_MS).then(function () { return doNode(queue[my]); }).then(function (r) {
            if (r === 'FATAL') return 'STOP';
            return next();
          });
        })();
      }
      function phase() {
        var workers = [];
        for (var w = 0; w < CONC; w++) workers.push(worker());
        return Promise.all(workers).then(function () {
          return flushCat().then(function () {
            if (PSA.stopReq || st.strikes >= MAX_STRIKES) return false;
            var nq = rebuild();
            if (!nq.length) return false;
            log('CATALOG: فاز بعد — ' + nq.length + ' گره جدید (بچههای سقف‌خورده)');
            queue = nq; qidx = 0;
            return true;
          });
        });
      }
      (function loop() {
        phase().then(function (again) {
          if (again && !PSA.stopReq) { loop(); return; }
          PSA.running = false;
          var left = rebuild().length;
          log('CATALOG پایان: گره ' + st.nodes + ' | خطا ' + st.errs + ' | حذف غیرمرتبط ' + st.dropped + ' | مانده ' + left +
              (left && PSA.stopReq ? ' (توقف درخواستی — ادامه: همان فرمان)' : '') +
              ' | وضعیت: __psaStatus() | خروجی: __psaExportCatalog()');
        });
      })();
    });
  };

  window.__psaExportCatalog = function () {
    getAll('catalog').then(function (arr) {
      var rows = [['کد پیام', 'IRC', 'کد ژنریک', 'نام فارسی', 'نام انگلیسی', 'isGeneric', 'قیمت واحد (ریال)', 'تاریخ قیمت (میلادی)']];
      arr.forEach(function (r) { rows.push([r.p, r.ic, r.g, r.f, r.e, r.ig ? '1' : '', r.pr == null ? '' : r.pr, r.ut || '']); });
      csvDownload('payam_catalog.csv', rows);
      log('CATALOG EXPORT: ' + arr.length + ' رکورد');
    });
  };
  /* ---------------- پاس نام ۴: کلمهٔ دوم انتخابی (برای صفرها و ابهام‌های پاس ۱ و ۳) ---------------- */
  function ensurePairs3(cb) {
    if (PSA.pairs4) { cb(PSA.pairs4); return; }
    log('در حال دانلود لیست نام پاس ۴…');
    fetch(RAW_SUPPNAME4).then(function (r) { return r.json(); }).then(function (j) {
      PSA.pairs4 = j; log('NAME4 LIST READY: ' + j.length + ' ردیف. حالا: __psaRunSuppName4()');
      cb(j);
    }).catch(function (e) { log('خطا در دانلود لیست نام۳: ' + e); });
  }
  window.__psaRunSuppName4 = function (limit) {
    ensurePairs3(function (pairs) {
      var keys = pairs.map(function (x) { return x[0]; });
      PSA.pairMap4 = {}; pairs.forEach(function (x) { PSA.pairMap4[x[0]] = x[1]; });
      runQueue(keys, 'suppname4', function (json, kw) { return pickCands(json, PSA.pairMap4[kw] || kw); }, { limit: limit, kwOf: function (k) { return PSA.pairMap4[k] || k; } });
    });
  };
  window.__psaExportSuppName4 = function () {
    ensurePairs3(function (pairs) {
      stateMap('suppname4').then(function (st) {
        var rows = [['کد IRC', 'کلمه جستجو', 'تعداد نتایج', 'کد پیام کاندیدا', 'نام فارسی کاندیدا', 'نام انگلیسی کاندیدا', 'کد ژنریک کاندیدا', 'IRC کاندیدا', 'قیمت کاندیدا (ریال)', 'تاریخ قیمت (میلادی)']];
        pairs.forEach(function (x) {
          var irc = x[0], kw = x[1], r = st[irc];
          if (!r) { rows.push([irc, kw, 'pending', '', '', '', '', '', '', '']); return; }
          if (!r.it || !r.it.length) { rows.push([irc, kw, r.n, '', '', '', '', '', '', '']); return; }
          r.it.forEach(function (c) { rows.push([irc, kw, r.n, c.p, c.f, c.e, c.g, c.ic, c.pr == null ? '' : c.pr, c.ut || '']); });
        });
        csvDownload('payam_suppname4_results.csv', rows);
      });
    });
  };
  log('موتور API نسخه ۸ (IndexedDB) آماده است. فرمان‌ها: __psaRunIRC() | __psaRunSupp() | __psaRunGen() | __psaRunPrice() | __psaRunSuppName4() | __psaProbeAll2() | __psaRunCatalog(4,100) | __psaExportCatalog() | __psaStatus() | __psaStop()');
  migrate();
  ensureList(function () {});
})();
