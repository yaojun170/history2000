import fs from 'fs';
import path from 'path';

const c1Path = '/Users/yaojun/devcode/aispace/antigravity_chats/history2000/src/data/timeline/century-1.json';
const c2Path = '/Users/yaojun/devcode/aispace/antigravity_chats/history2000/src/data/timeline/century-2.json';

// Supplement Century 1
if (fs.existsSync(c1Path)) {
  const data = JSON.parse(fs.readFileSync(c1Path, 'utf8'));

  // Year 9
  const y9 = data.find(e => e.year === 9);
  if (y9 && y9.events.length === 1) {
    y9.events.push({
      title: "始建国元年王莽大规模复古官制与行政区划调整",
      category: "政权更迭",
      desc: "新帝王莽登基伊始，执着于恢复周礼的理想主义政治，下令在全国推行彻底的复古官制改革。他频繁更改中央与地方的官名、郡县地名，导致全国一百多个郡、数千个县的名号数年间变易数次。由于公文驿传无法识别新地名，官吏甚至记不住自己的衙门和统辖郡县，导致帝国基层行政效率极度低下，怨声载道，极大地削弱了新朝对地方世族的控制力。"
    });
  }

  // Year 23
  const y23 = data.find(e => e.year === 23);
  if (y23 && y23.events.length === 1) {
    y23.events.push({
      title: "更始帝刘玄迁都宛城与新朝宗室内部权力博弈",
      category: "政权更迭",
      desc: "绿林军拥立更始帝刘玄在宛城重建汉室并改元更始。随着昆阳大战汉军威名大震，起义军内部的汉室宗室与绿林军将领之间爆发了深层的权力斗争。更始帝忌惮南阳宗室首领刘縯（刘秀之兄）在军中和士族中的极高声望，联合绿林将领朱鲔等人以莫须有的叛逆罪名将刘縯杀害。刘秀闻讯隐忍克制，被迫西向拜谢，南阳宗室同盟自此分裂并埋下日后决裂的隐患。"
    });
  }

  // Year 25
  const y25 = data.find(e => e.year === 25);
  if (y25 && y25.events.length === 1) {
    y25.events.push({
      title: "樊崇赤眉军攻破长安与更始政权彻底覆灭",
      category: "军事战役",
      desc: "九月，樊崇率领三十万赤眉起义大军，以锐不可当之势突破崤函通道攻入长安城。更始帝刘玄在部下众叛亲离之下，被迫单骑出逃，最终献上传国玉玺向赤眉军投降，随后被赤眉将领缢杀。赤眉军在长安拥立汉室后代刘盆子为傀儡皇帝，建立赤眉政权。然而大军入城后缺乏纪律，大肆烧杀抢掠，使得关中地区陷入了空前惨烈的人口与生态浩劫之中。"
    });
  }

  // Year 73
  const y73 = data.find(e => e.year === 73);
  if (y73 && y73.events.length === 1) {
    y73.events.push({
      title: "窦固大破北匈奴于天山与光复伊吾卢",
      category: "军事战役",
      desc: "东汉奉车都督窦固等四路大军出击漠北北伐北匈奴。窦固亲率主力骑兵出酒泉，在大漠深处的天山脚下（今甘肃伊吾一带）与北匈奴呼衍王主力展开决战。汉军大破匈奴军，追击至蒲类海（今新疆巴里坤湖），斩首数千级。随后，窦固顺势收复战略重镇伊吾卢，重新设立宜禾都尉，这一大捷彻底打破了北匈奴对西域东侧的控制，为班超经略西域铺平了道路。"
    });
  }

  // Year 88
  const y88 = data.find(e => e.year === 88);
  if (y88 && y88.events.length === 1) {
    y88.events.push({
      title: "汉和帝刘肇即位与窦太后临朝称制",
      category: "政权更迭",
      desc: "三月，三十一岁的汉章帝刘炟崩逝，十岁的皇太子刘肇即位为汉和帝。因新帝年幼，章帝皇后窦氏晋升为皇太后并正式临朝称制。窦太后重用其兄窦宪、弟窦笃等人，窦氏兄弟分掌兵权与尚书台，独揽朝廷军政大权。窦宪依仗外戚身份在朝中排挤忠良、残杀异己，使得东汉政治自此滑入长达百年的外戚专权与宫廷斗争的畸形循环。"
    });
  }

  fs.writeFileSync(c1Path, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log("✅ Supplemented Century 1 events!");
}

// Supplement Century 2
if (fs.existsSync(c2Path)) {
  const data = JSON.parse(fs.readFileSync(c2Path, 'utf8'));

  // Year 105
  const y105 = data.find(e => e.year === 105);
  if (y105 && y105.events.length === 1) {
    y105.events.push({
      title: "邓太后临朝称制与邓氏外戚掌握朝政",
      category: "政权更迭",
      desc: "十二月，二十七岁的汉和帝刘肇崩逝，邓绥太后册立出生仅百日的殇帝刘隆，并正式临朝称制。邓太后极具政治才干，在亲政后起用其兄邓骘掌握朝廷军政机要。邓氏外戚虽然在执政期间表现出了克己好儒、节俭赈灾的高尚作风，但外戚掌权的政治格局仍旧进一步固化，为东汉中后期外戚与宦官交替专权的体制打下了更深的烙印。"
    });
  }

  // Year 125
  const y125 = data.find(e => e.year === 125);
  if (y125 && y125.events.length === 1) {
    y125.events.push({
      title: "阎显外戚集团倾覆与少帝刘懿驾崩",
      category: "政权更迭",
      desc: "三月，汉安帝突然驾崩，阎皇后为独揽大权，伙同兄弟阎显迎立幼小的济北惠王之子刘懿为少帝，阎氏外戚集团独揽朝政。同年十月，少帝刘懿仅在位二百余日便暴病夭折。中常侍孙程等十九名年轻宦官看准时机，秘密联络羽林军，在洛阳德阳殿发动雷霆宫廷政变，诛杀了阎显及其党羽，废黜阎太后，迎立安帝太子刘保为汉顺帝，顺帝朝宦官势力由此剧烈膨胀。"
    });
  }

  // Year 184
  const y184 = data.find(e => e.year === 184);
  if (y184 && y184.events.length === 1) {
    y184.events.push({
      title: "汉灵帝宣布解除党锢大赦天下党人",
      category: "政权更迭",
      desc: "三月，黄巾大起义以雷霆之势席卷全国，天下震动。汉灵帝在北军统帅皇甫嵩的强烈建议下，深恐遭到长期压迫和禁锢的“党人”（世家名士与太学生）会绝望之下与黄巾起义军合流，被迫下诏宣布彻底解除党锢，大赦天下被幽禁流放的党人，允许其重返洛阳或参军报国。这一历史性妥协虽然阻止了党人通匪，但也彻底终结了灵帝朝的专制高压。"
    });
  }

  // Year 189
  const y189 = data.find(e => e.year === 189);
  if (y189 && y189.events.length === 1) {
    y189.events.push({
      title: "袁绍禁军火烧南宫与宦官集团彻底覆灭",
      category: "政权更迭",
      desc: "八月，大将军何进谋诛宦官泄密被杀，袁绍、袁术兄弟怒火中烧，亲率羽林军与禁军精锐强行攻破洛阳皇宫大门。士兵在宫中见无须者便杀，火烧南宫，斩杀宦官两千余人，史称“宫中之变”。以张让、段珪为首的“十常侍”被迫裹挟汉少帝及陈留王刘协漏夜出逃黄河岸边，最终投水自尽。统治东汉朝政数十年的宦官集团在血腥中彻底覆灭。"
    });
  }

  // Year 196
  const y196 = data.find(e => e.year === 196);
  if (y196 && y196.events.length === 1) {
    y196.events.push({
      title: "孙策扫平江东大败刘繇奠定东吴政权基石",
      category: "政权更迭",
      desc: "年仅二十一岁的“小霸王”孙策借袁术兵马渡江南下，开始了平定江东的英雄创业。孙策在历阳召集旧部，以迅雷不及掩耳之势渡江击败了汉廷扬州刺史刘繇，接连攻克牛渚、神亭，并在短时间内扫平了吴郡、会稽等郡的割据豪强。孙策严明军纪，深受百姓拥戴，江东名士如周瑜、张昭纷纷归附，为日后孙吴帝国的建立奠定了极为坚固的版图基石。"
    });
  }

  fs.writeFileSync(c2Path, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log("✅ Supplemented Century 2 events!");
}
