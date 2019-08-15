/**
 * Copy Right Information   : hc360.com WebF2E
 * Project                  : control
 * jQuery version used      : 1.6
 * Comments                 : control
 * Version                  : 1.00
 * Modification history     : 2011.9.15
 * F2E Common Control
 * 1. 2011.9.15 慧聪网技术中心 WEB前端 jun new
 * 2. 2013.2.9  update by 慧聪网技术中心 WEB前端 zhuyangyang  for 用户行为分析
 * 3. 2013.4.22 update by 慧聪网技术中心 WEB前端 zhuyangyang  for 搜索结果页广告效果
 * 4. 2013.5.22 update by 慧聪网技术中心 WEB前端 zhuyangyang  for 慧聪首页猜你喜欢
 * 5. 2014.2.19 update by 慧聪网技术中心 WEB前端 zhuyangyang  for 三体系问卷调查
 * 6. 2014.8.26 update by 慧聪网技术中心 WEB前端 zhuyangyang  for 添加百度监测代码，以统计去除爬虫的全站流量
 */

/*添加百度监测代码，以统计去除爬虫的全站流量*/
function getpagetype() {
    var ifrtrue,
        href;
    try {
        href = window.top.location.href;
    } catch (exp) {
        ifrtrue = 2;
    }
    if (ifrtrue != 2) {
        window.location.href == href ? ifrtrue = 0 : ifrtrue = 1;
        if (href == undefined) {
            ifrtrue = 2;
        }
    }
    return ifrtrue;
}
var _hmt = _hmt || [];
(function() {
    if (getpagetype() === 0) {
        var hm = document.createElement("script");
        hm.src = "//hm.baidu.com/hm.js?e1e386be074a459371b2832363c0d7e7";
        var s = document.getElementsByTagName("script")[0];
        s.parentNode.insertBefore(hm, s);
    }
})();


/**
 * 载入用户行为分析脚本
 */
document.write("<script src='//style.org.hc360.cn/js/module/common/logrecordservice.min.js'><\/script>");
/**
 * 搜索结果页广告效果
 */

HC.HUB.addEvent(window, function() {
        if (typeof jQuery !== 'undefined' && jQuery(".HC_adfixedTop").length > 0) {
            HC.HUB.addCss('//style.org.hc360.cn/js/build/source/widgets/adfixedtop/hc.adfixedtop.css');
            HC.HUB.addScript('//style.org.hc360.cn/js/build/source/widgets/adfixedtop/hc.adfixedtop.js');
        }
    }, "load")
    //流量宝功能
HC.HUB.addEvent(window, function() {
    var Hc_url = window.location.href;
    var rule = /\/\/info.*.hc360.com\/\d{4}\/\d{2}\/(\d+).shtml/;
    if (rule.test(Hc_url)) {
        HC.HUB.addScript('//style.org.hc360.cn/js/module/info/info_liuliangbao.js');
    }
}, "load")

HC.HUB.addEvent(window, function() {
    HC.HUB.addScript('//www.googletagmanager.com/gtag/js?id=UA-122232617-1',function () {
        window.dataLayer = window.dataLayer || [];
        function gtag() {
            dataLayer.push(arguments);
        };
        gtag('js', new Date());
        gtag('config', 'UA-122232617-1');
    });
}, "load")


/*前端性能框架JS*/
HC.HUB.addEvent(window, function() {
    HC.HUB.addScript('//style.org.hc360.cn/js/module/common/performance.min.js');
}, "load")

/*资讯页加推荐模块判断*/
HC.HUB.addEvent(window, function() {
    var infoURL = location.href;
    var arr = ['cm', '2s', 'cmp'];
    var wname = infoURL.substring(infoURL.indexOf(".") + 1, infoURL.indexOf(".hc360.com"));
    var INFO_REG = /^http\:\/\/info\.\S+\.hc360\.com\/\d{4}\/\d{1,2}\/\d+\.shtml/;
    if (INFO_REG.test(infoURL)) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === wname) {
                HC.HUB.addCss('//style.org.hc360.cn/css/hyNew/nStyle.css');
                HC.HUB.addScript('//style.org.hc360.cn/js/module/detail/hc.info.recomdMod.min.js', function() {
                    jQuery.infoRecomdMod();
                });
            }
        }

    }
}, "load");

/**
 * [百度联盟广告加曝光统计      lishuna 2015-12-14 add]
 * [百度联盟广告加曝光统计修改  wanghao 2016-12-19 修改页面上百度网盟广告的获取方式，添加广告的点击检测]
 */
HC.HUB.addEvent(window, function() {

    /**
     * [若未初始化百度网盟广告相关的全局变量，则直接返回]
     */
    if (!(window.BAIDU_DUP && window.BAIDU_DUP.slot && window.BAIDU_DUP.slot.slotsMap)) {
        return;
    }

    /**
     * [list 获取百度广告数据对象]
     * @type {Array}
     */
    var list = window.BAIDU_DUP.slot.slotsMap,

        /**
         * [exposureadvert 曝光数据列表]
         * @type {Array}
         */
        exposureadvert = [],

        /**
         * [flowControl 流量控制函数]
         * @return {Boolean} [是否需要发送曝光数据及添加用户点击检测]
         */
        flowControl = function() {
            var returnValue = false,
                tempRegExp = new RegExp('(//b2b.hc360.com/supplyself/\\d+.html)|(//m.hc360.com/prod-\\w+?/\\d+.html)', 'ig');
            return tempRegExp.test(window.location.href) && window.ismmt;
        },

        /**
         * 当前鼠标悬浮的广告位对象
         */
        activeContainer;

    /**
     * [不在流量控制范围的页面不执行后续逻辑]
     */
    //  「 产品要求获取所有百度广告的检测，所以注掉 」
    // if (!flowControl()) {
    //  return;
    // }

    /**
     * [绑定窗口丢失焦点事件，获取当前鼠标悬浮的广告位对象，发送监测点数据；]
     * [因为百度广告是以iframe的方式引入到页面的，所以无法直接通过绑定元素点击的方式绑定点击事件来发送监测数据；此处为广告位元素绑定了移入移出事件，通过一个相对宽泛作用域的变量在移入时记录移入的广告位数据对象，移出时清除广告数据对象。]
     * [在window丢失焦点时，且广告为数据对象非空时视为广告位被点击，进而发送广告位点击检测数据]
     */
    $(window).blur(function() {
        if (activeContainer) {
            HC.UBA.sendUserlogsElement('UserBehavior_adbaidu_' + activeContainer.slotId);
        }

    });

    /**
     * [填充曝光数据列表并发送]
     */
    $.each(list, function(index, node) {
        exposureadvert.push("gg_bdwm?pid=" + HC.PAGE_ID + "&bd=" + node.slotId);

        /**
         * [绑定百度广告元素点击事件，并发送检测数据]
         */
        node.containerId && $('#' + node.containerId).mouseover(function(event) {
            activeContainer = node;

        }).mouseout(function() {
            activeContainer = null;
            window.focus();
        });
    });
    var expdata = {
        exposurecompany: "",
        exposureproduct: "",
        exposureadvert: exposureadvert.join("#&#")
    };
    setTimeout(function() {
        HC.exposure.sendexposurelog(expdata);
    }, 2000);
}, "load");

/**
 * [资讯页含指定屏蔽词页面跳转到404页面]
 */
(function() {
    var INFO_REG = /\/\/info.*.hc360.com\/\d{4}\/\d{2}\/([\w-]+?).shtml/,
        HSOT_REG = /\/\/(sxy|toutiao|wujin|jj|bm|med|machine|it|gift|textile|tele|kjxf|cm|printing).hc360.com\//,
        // HSOT_REG = /\/\/(sxy|toutiao|wujin|jj|bm|med|machine|it|gift|textile).hc360.com\/([\w-\/]+?).html/,
        NEWS_REG = /\/\/www.[a-zA-Z0-9]{1,}.hc360.com\//,
        infoURL = location.href,
        words = ["大马士革刀","找机汇","大马士革刀胚","蝴蝶刀","直军刀","军刀军刀","卡片军刀","开山刀","七孔开山刀","开山刀系列","丛林开山刀","潜水刀","三棱刀","伞兵刀","蝴蝶甩刀","武士刀","加厚刻龙武士刀","武士刀批发","潜水直刀","加长直刀","膨胀爆破剂","静态爆破剂","消防导火索","汽油弹","燃烧瓶","烟雾弹","消防演习烟雾弹","炸药箱","654k配件","b50型材","巴雷特","气动步枪","狙击步枪","碰珠弹夹","m4弹夹","仿真枪","钢珠弹","钢珠弹弓","弹弓钢珠弹","狗管膛线管","狗配件","气弹枪","仿真气弹枪","金属气弹枪","高压气弹枪","气狗管","气狗消声器","充气狗","气狗配件","汽枪配件","铅弹模具","5铅弹头模具","真手枪","六发左轮发令枪","钢珠枪","狙击枪","气枪弹","气枪管","防真枪","连发枪","气枪配件","钢珠手枪","真枪仿真","仿真手枪","一比一防真枪","组合枪套","重机枪","重机关枪","喷火枪批发","金属手枪","气狗秃鹰配件","秃鹰套件","秃鹰配件","秃鹰管","秃鹰膛线管","5秃鹰膛线管","秃鹰后握把","消音器配件","消音器批发","燕尾套件","仿真子弹","大马士革刀呸","m9军刀","卖军刀","定制军刀","兰博刀","苗刀","尼泊尔刀3","钛合金潜水刀","甩刀","供应武士刀","进口直刀","直刀批发","催泪弹","导弹护卫舰","导弹","反坦克导弹","军事导弹","171号导弹驱逐舰","169导弹","v2导弹","雷管箱","雷管管壳","沈阳雷管壳","雷管壳","太安","杀虫烟雾弹","演戏烟雾弹","演习烟雾弹","消防演习用烟雾弹","蟑螂烟雾弹","烟雾弹消防","烟饼烟雾弹","消防烟雾弹","6鱼雷","鱼雷","掌心雷","92F型","ak47装备","m9批发","巴雷特狙击","弹夹","铜弹夹","弹轮","压缩弹轮","底火","发射药","仿真AK","仿真长狗","铝合金弓","鲁格","气狗","气抢","汽狗配件","汽抢价格","汽抢","左轮手枪1","手枪10元","手枪11","散弹枪11","气枪f30","真枪88式","骚本","沙漠之鹰2","狩猎网","秃鹰","瓦尔特","锡锋","消音器","消音器加工","消音器消声器","消音器消音器","消音器制造","生产消音器","消音器供应","消音器配件采购","消音器配件批发","雄鹰m05","批发子弹","子弹批发","阿昌刀","勃朗宁刀","匕首刀","丛林刀具","弹簧刀杆","立特弹簧刀具","弹簧刀具","弹簧刀片","弹簧刀折叠","其它弹簧刀具","戈博刀","蝴蝶刀具","户撒刀具","户撒刀","云南户撒刀","户撒刀王","功能军刀","军刀卡","11军刀","定做军刀","德军刀","创新军刀","外贸军刀","8功能军刀","多用军刀套装","13种功能军刀","17开军刀","精品军刀","进口军刀","精美军刀","军刀具","M1军刀","美国进口军刀","美国军刀","蝴蝶军刀","开山刀片","开山刀具","兰博刀具","龙泉苗刀","尼泊尔刀","三棱刀片","合金甩刀","锌合金武士刀","宝剑武士刀","小武士刀","白武士刀","龙泉武士刀","龙泉宝剑武士刀","花纹钢武士刀","日本刀武士刀","高档武士刀","龙泉宝剑刀武士刀","金属武士刀","花梨木武士刀","日本武士刀","批发日本武士刀","木武士刀","直武士刀","手工武士刀","武士刀架","高碳钢武士刀","烧刃武士刀","死神武士刀","工艺刀剑武士刀","武士刀套刀","开刃武士刀","武士刀未开刃","武士刀剑","雅登直刀","圆直刀","阳江直刀","合金直刀","裁布直刀","钨钢双刃直刀","3刃合金直刀","槽直刀","6MM直刀","裁条直刀","钨钢直刀","川木直刀","短直刀","大直刀","小直刀","木工双刃直刀","虎鲨直刀","横切直刀","高速钢直刀","手工直刀","日本直刀","礼品直刀","木工雕刻机直刀","分条机用直刀","龙泉直刀","木工加长直刀","龙泉直刀刀","石英石直刀","机械直刀片","碳钢直刀","金刚石直刀","鹰牌直刀","TCT直刀","0.6直刀片","川木刀具直刀","清底直刀","双刃直刀","忍者直刀","切纸直刀片","电剪直刀片","野营直刀","ER20直刀柄","刨花直刀","裁剪直刀","单刃直刀","刀具直刀","电剪刀直刀","雕刻刀直刀","大马士革钢直刀","高档直刀","戈博直刀","管直刀具","进口双刃直刀","浪潮直刀","磨刀机直刀","木柄直刀","求生直刀","唐直刀","圆刀直刀","直刀刀片","直刀电剪","直刀电剪刀","直刀片","直刀切台","大马士革小直刀","高硬度直刀","高硬度小直刀","直齿直刀","专业型C4","TNT生产设备","深圳爆破剂","带导弹直升机","导弹车","导弹箱","导弹艇","手榴弹箱","硝化甘油溶液","CP99配件","M4A1配件","锌合金弹夹","弹夹袋","弹夹包","迷彩弹夹","气抢配件","铅弹机","锡锋配件","带消音器","消音器管","消音器采购","子弹网","王逸凡","胡进","胡耀元","李海龙","罗建法","陈志怀","刘卫华","石章强","钟超军","习近平","总理","总书记","李克强","国家主席","市委书记","军委主席","国家领导人","政治局委员","张德江","俞正声","刘云山","王岐山","张高丽","中央书记处书记","军事委员","纪检委","最佳","最具","最爱","最赚","最优","最优秀","最好","最大","最大程度","最高","最高级","最高档","最奢侈","最低","最低级","最低价","最便宜","史上最低价","最流行","最受欢迎","最时尚","最聚拢","最符合","最舒适","最先","最先进","最先进科学","最先进加工工艺","最先享受","最后","最后一波","最新","最新科技","最新科学","第一","中国第一","全网第一","销量第一","排名第一","唯一","第一品牌","NO.1","TOP.1","独一无二","全国第一","一流","仅此一次","仅此一款","全国X大品牌之一","国家级","全球级","宇宙级","世界级","顶级","顶尖","尖端","顶级工艺","顶级享受","高级","极品","极佳","绝佳","绝对","终极","极致","首个","首选","独家","独家配方","首发","全网首发","全国首发","XX网独家","首次","首款","全国销量冠军","国家免检","中国驰名","驰名商标","国际品质","大牌","名牌","王牌","领袖品牌","世界领先","领先","遥遥领先","领导者","缔造者","创领品牌","领先上市","巨星","著名","掌门人","至尊","奢侈","资深","领袖","之王","王者","史无前例","前无古人","永久","万能","祖传","特效","无敌","纯天然","高档","正品","超赚","老字号","中国驰名商标","特供","专供","专家推荐","质量免检","免抽检","销量最高","服务最好","质量最优","秒杀全网","全网最优","质量最好","全网底价","类目底价","同行底价","价格最低","口碑最好","服务第一","效果最好","最强","品质最好","抄底","第1","最正宗","最新鲜","最极致","国际最热销","国际最强","国际规模最大","国际服务第一","顶级品牌","顶级广告支持","CCTV最佳雇主","韩国最热卖","韩国销量第一","质量第一","欧美最热卖","欧美销量第一","世界最低价","行业最热卖","行业销量第一","行业最低价","品质最牛","品质最优","品质最强","同行人气第一","同行销量第一","口碑第一","口碑顶级","全网价格最低","全网最强","全网最新","全网最大","全网品质最好","全网最便宜","全网冠军","全网最高","全网首家","全网抄底","全网最实惠","全网最专业","全网最时尚","全网最受欢迎","全网第1","全网最火","全网最安全","全网之冠","全网之王","全网最正宗","全网最新鲜","全网最极致","全网质量最好","全球最热销","全球最强","全球规模最大","全球服务第一","国内最热销","国内最强","国内规模最大","国内服务第一","世界最热销","世界第一","世界最强","世界规模最大","世界服务第一","顶尖品牌","亚洲销量冠军","全网销量冠军","全网最低价","全网最热卖","全网销量最高","全球第一","亚洲第一","欧美第一","全网人气第一","同行第一","同行最好","领导品牌","顶尖技术","著名商标","信誉第一","精确","最新技术","国家级产品","填补国内空白","首家","全网销量第一","全球首发","全国首家","销量冠军","绝无仅有","时尚最低价","点击领奖","恭喜获奖","全民免单","点击有惊喜","点击获取","点击转身","点击试穿","点击翻转","领取奖品","秒杀","抢爆","再不抢就没了","不会更便宜了","错过就没机会了","万人疯抢","全民疯抢","全民抢购","抢疯了","卖疯了","限时抢购","倒计时","仅限","周年庆","特惠趴","购物大趴","闪购","品牌团","精品团","随时结束","随时涨价","马上降价","疯抢","抢购","价格爆降","惊现","惊爆","影帝","影后","天王","国旗","国徽","国歌","贵族","高贵","隐贵","上流","层峰","富人区","名门","帝都","皇城","皇室领地","皇家","皇室","皇族","殿堂","白宫","王府","府邸","皇室住所","售罄","售空","不会再便宜","错过不再","错过即无","未曾有过的","免费领","免费住","0首付","免首付","零距离","价格你来定","抽奖","百分之百","创领","领航","耀领","黄金旺铺","黄金价值","黄金地段","外国货币","首席","首府","首屈一指","国门","国宅","独创","独据","开发者","创始者","发明者","绝版","珍稀","臻稀","绝不在有","稀世珍宝","千金难求","世所罕见","不可多得","空前绝后","寥寥无几","屈指可数","致极","极具","至臻","臻品","臻致","臻席","问鼎","非此莫属","前所未有","无人能及","鼎级","鼎冠","定鼎","翘楚之作","不可再生","寸土寸金","淋漓尽致","无与伦比","卓著","最","0风险","百分百","真皮","100%","最热卖","最全","最热销","人气第一","零风险","几天几夜","单品团","趁现在","没有他就XX","使用人民币图样","国家XX机关推荐","国家XX领导人推荐","无需国家质量检测","最底", "CCTV国家"],
        wordRule = new RegExp(words.join('|'), 'ig');
    // if (INFO_REG.test(infoURL) || HSOT_REG.test(infoURL) || NEWS_REG.test(infoURL)) {
    //     var str = document.body.innerHTML.replace(/[\r\n\t]/img, '');
    //     if (wordRule.test(str)) {
    //         $.each(str.match(wordRule), function (index,item){
    //             var qwe = new RegExp(item,'ig');
    //             str = str.replace(qwe, '*');
    //         });
    //         document.body.innerHTML = str;
    //         // var qwe = new RegExp(str.match(wordRule),'ig');
    //         // console.log(str.replace(qwe,''));
    //         // document.body.innerHTML = str.replace(qwe,'')
    //
    //         //window.location.href = '//b2b.hc360.com/static404.html';
    //     }
    // }

    if (INFO_REG.test(infoURL) || HSOT_REG.test(infoURL) || NEWS_REG.test(infoURL)) {
        var eleAll = document.all;
        var noteEle = ['HTML', 'BODY', 'IFRAME', 'SCRIPT'],
            noteAttr = 'prohibited',
            newEle = [];
        for (var i = 0; i < eleAll.length;i++) {
            var tagName = eleAll[i].tagName;
            var isProh = eleAll[i].getAttribute('prohibited');
            if (isProh === null && noteEle.indexOf(tagName) === -1) {
                newEle.push(eleAll[i]);
            };
        };
        for (var j = 0;j<newEle.length;j++) {
            var str = newEle[j].innerHTML.replace(/[\r\n\t]/img, '');
            if (wordRule.test(str)) {
                $.each(str.match(wordRule), function (index,item){
                    var qwe = new RegExp(item,'ig');
                    str = str.replace(qwe, '*');
                });
                newEle[j].innerHTML = str;
            }
        };
    };

})();

/** [资讯终极页标王关键字] */
HC.HUB.addScript('//style.org.hc360.cn/js/module/info/hc.info.topad.min.js', function() {});
