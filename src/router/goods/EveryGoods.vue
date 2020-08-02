<template>
  <div id="deatils-goods">
    <!--    导航栏-->
<!--    <h3>{{$store.state.commodityMessage}}</h3>-->
    <deatils-nav :centerArray="centerArray" class="dnav" @onClicks="onClicks" ref="deatilsNavs"></deatils-nav>
    <scroll class="deatils-scroll" ref="scroll" @scrollPostiton="scrollPostiton" :proberTypes="3">
      <!-- 不知道什么错误，要把导航放在这里才能滚动，很奇怪     -->
      <deatils-nav :centerArray="centerArray" v-show="false"></deatils-nav>
      <!--轮播图-->
      <evert-goods-seed :Nimg="Nimg"></evert-goods-seed>
      <!--    基本信息-->
      <deatil-base-info :goods="goods"></deatil-base-info>
      <!--    <details-message :baseMessage="baseMessage"></details-message>-->
      <!--    店铺信息-->
      <deatil-shop-info :shop="shop"></deatil-shop-info>
      <details-goods-info :detailInfo="detailInfo" @imageLoad="imageLoad" ref="detailsGoodsInfos"></details-goods-info>
      <!--    详情信息-->
      <deatils-information :deatils-informations="dataInformations" ref="deatilsInformations"></deatils-information>
      <!-- 评价-->
      <deatils-appraise :comment-info="commentInfo" ref="deatilsAppraises"></deatils-appraise>
      <!-- 推荐信息-->
      <goods-main :goods-data=recommends class="gmr" ref="recommends"></goods-main>
    </scroll>
    <!--    回顶按钮-->
    <back-top class="backtop" @click.native="backTops" v-show="isShowBackTopButton"></back-top>
    <!--    底部选项-->
    <deatils-bottom @addToCart="addToCart"></deatils-bottom>

    <toast :message="M" :isShow="isShow"></toast>

  </div>
</template>

<script>

  //导入detailo.js发送请求
  import {getDeatil, detailBaseMessage, Shop, getRecommend} from "../../network/detail";
  //子模块
  import DeatilsNav from "../../views/goodsDeatils/DeatilsNav";
  import EvertGoodsSeed from "views/goodsDeatils/EvertGoodsSeed";
  import DeatilBaseInfo from "../../views/goodsDeatils/DeatilBaseInfo";
  import DeatilShopInfo from "../../views/goodsDeatils/DeatilShopInfo";
  import DetailsGoodsInfo from "../../views/goodsDeatils/DetailsGoodsInfo";
  import DeatilsInformation from "../../views/goodsDeatils/DeatilsInformation";
  import DeatilsAppraise from "../../views/goodsDeatils/DeatilsAppraise";
  import GoodsMain from "../../components/content/googs/GoodsMain";
  import DeatilsBottom from "../../views/goodsDeatils/DeatilsBottom";
  // 滚动模块
  import Scroll from "components/common/scroll/Scroll";
  //回顶按钮
  import BackTop from "../../components/content/backTop/BackTop";
  import {refreshGoods} from "../../common/mixin";

import Toast from "../../components/common/toast/Toast";
  export default {
    name: "EveryGoods",
    mixins: [refreshGoods],
    components: {
      DeatilsNav,
      EvertGoodsSeed,
      DeatilShopInfo,
      DeatilBaseInfo,
      Scroll,
      DetailsGoodsInfo,
      BackTop,
      DeatilsInformation,
      DeatilsAppraise,
      GoodsMain,
      DeatilsBottom,
      Toast
    },
    data() {
      return {
        id:undefined,
        //需要显示的选项
        centerArray: ['商品', '参数', '评论', '推荐'],
        //保存轮播图的图片
        Nimg: [],
        //基本信息
        // baseMessage:{},
        goods: {},
        //店铺信息
        shop: {},
        //详情图片数据
        detailInfo: {},
        //回顶按钮初始化状态
        isShowBackTopButton: false,
        //详情数据信息
        dataInformations: {},
        //评论
        commentInfo: {},
        //推荐信息
        recommends: [],
        //收集每个导航指定的位置
        navigationPostiton: [],
        //滚动到对应的导航。保存以防止多次触发重复
        currentIndexs: null,
        M:'',
        isShow:false
      }
    },
    created() {
      //在组建创建时获取id
      this.id = this.$route.params.id
      // console.log(this.id);
      //根据id发送网络请求，并得到数据
      getDeatil(this.id).then(res => {
        // console.log(res);
        this.Nimg = res.data.result.itemInfo.topImages
        // console.log(res.data.result.itemInfo.topImages.length)
        let data = res.data.result
        //取出基本信息数据、
        // this.baseMessage = new detailBaseMessage(data.itemInfo,data.columns,data.shopInfo.services)
        this.goods = new detailBaseMessage(data.itemInfo, data.columns, data.shopInfo.services)
        //取出店铺信息：
        this.shop = new Shop(data.shopInfo)
        //详情图片
        this.detailInfo = data.detailInfo
        //详情数据信息
        this.dataInformations = data.itemParams
        //评论
        if (data.rate.cRate !== 0) {
          this.commentInfo = data.rate.list[0]
        }
      })
      //取到推荐的信息
      getRecommend().then(res => {
        this.recommends = res.data.data.list
        // console.log(res)
      })
    },
    methods: {
      //图片加载完成
      imageLoad() {
        //加载完时修正可滚动高度
        this.$refs.scroll.refreshs()
        //加载完事计算个个导航对应的位置，并保存
        this.navigationPostiton = []
        this.navigationPostiton = [0, -this.$refs.deatilsInformations.$el.offsetTop, -this.$refs.deatilsAppraises.$el.offsetTop, -this.$refs.recommends.$el.offsetTop]
        // console.log("---")
      },
      //回到顶部的方法
      backTops() {
        // console.log('eee')
        this.$refs.scroll.backTop(0, 0, 1000)//调用scroll的backTop方法
      },
      scrollPostiton(position) {
        // console.log(position.y)
        //回顶按钮显与隐
        this.isShowBackTopButton = -position.y > 1000

        //根据位置更新的导航的选中
        let postitiony = -position.y
        let lengths = this.centerArray.length
        for (let i = 0; i < lengths; i++) {
          if (this.currentIndexs !== i &&
              ((lengths - 1 > i && postitiony <= -this.navigationPostiton[i + 1] && postitiony >= -this.navigationPostiton[i])
                  || (i >= lengths - 1 && postitiony >= -this.navigationPostiton[i]))) {
            // console.log(i)
            this.currentIndexs = i
            this.$refs.deatilsNavs.centerIsOnClickIndex = this.currentIndexs

          }
        }
      },
      //导航栏传过来的index,用于实现点击导航栏跳转到指定位置
      onClicks(index) {
        // console.log(index)
        // console.log(this.$refs.detailsGoodsInfos.$el.offsetTop)
        // this.$refs.scroll.backTop(0, -this.$refs.detailsGoodsInfos.$el.offsetTop, 1000)
        //该方法确实可以实现，但每次点击都需要计算,又不灵活
        // switch (index) {
        //   case 0:
        //     this.$refs.scroll.backTop(0, 0, 1000)
        //     break;
        //   case 1:
        //     this.$refs.scroll.backTop(0, -this.$refs.deatilsInformations.$el.offsetTop, 1000)
        //     break;
        //   case 2:
        //     this.$refs.scroll.backTop(0, -this.$refs.deatilsAppraises.$el.offsetTop, 1000)
        //     break;
        //   case 3:
        //     this.$refs.scroll.backTop(0, -this.$refs.recommends.$el.offsetTop, 1000)
        //     break;
        // }
        // console.log(this.navigationPostiton)
        this.$refs.scroll.backTop(0, this.navigationPostiton[index], 1000)
      },
      //点击购物车发送信息
      addToCart(){
        // console.log("eee")
        let commodityMessage = {}
        commodityMessage.iid = this.id
        commodityMessage.Nimg  = this.Nimg[0]
        commodityMessage.desc = this.goods.desc
        commodityMessage.price = this.goods.realPrice
        commodityMessage.count = 1
        // console.log(this.goods)
        // this.$store.commit('changecommodityMessage',commodityMessage)
        this.$store.dispatch('changecommodityMessage',commodityMessage).then(res=>{
          // console.log(res)
          // this.M = res
          // this.isShow = true
          // setTimeout(()=>{
          //   this.isShow = false
          // },1500)
          this.$toast.showToast(res)
        })

      }
    },
  }
</script>

<style scoped>
  #deatils-goods {
    position: relative;
    z-index: 9;
    background-color: white;
    height: 100vh;
  }

  .deatils-scroll {
    height: calc(100% - 44px);
    /*height: 100%;*/
    /*background-color: red;*/
    /*margin-top: -44px;*/
  }

  .dnav {
    position: relative;
    z-index: 9;
    background-color: white;
  }

  .backtop {
    position: fixed;
    top: 85%;
    left: 82%;
  }

  .gmr {
    text-align: center;
  }
</style>