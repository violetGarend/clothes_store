<template>
  <div id="home">
    <Navigation class="home-nav">
      <div slot="center">购物街</div>
    </Navigation>

    <tab-control :controlArray="['流行','新款','精选']" class="tab-controls" @activeIndex="activeIndex" ref="tabControl1" v-show="isShowFakeGoodsData"></tab-control>

    <scroll class="content" ref="scrolls" :proberTypes="3" @scrollPostiton="scrollPostiton" :pullUpLoads="true"
            @isPullingUp="isPullingUp">

      <home-banners :banners="banners" @homeBannerOnLoad="homeBannerOnLoad"></home-banners>
      <home-recommdends :recommdends="recommdends"></home-recommdends>
      <home-feature></home-feature>
      <tab-control :controlArray="['流行','新款','精选']" class="tab-control" @activeIndex="activeIndex"
                   ref="tabControl2"></tab-control>
      <goods-main :goodsData="goodsState"></goods-main>
    </scroll>

    <!--    回到顶部按钮-->
    <back-top class="backtop" @click.native="backTops" v-show="isShowBackTopButton"></back-top>

  </div>
</template>

<script>
  import Navigation from "@/components/common/navigation/Navigation";

  import HomeBanners from "./HomeSeed/HomeBanners";
  import HomeRecommdends from "./HomeSeed/HomeRecommdends";
  import HomeFeature from "./HomeSeed/HomeFeature";

  import TabControl from "components/common/tabcontrol/TabControl";

  import GoodsMain from "components/content/googs/GoodsMain";
  import BackTop from "components/content/backTop/BackTop";
  import Scroll from "components/common/scroll/Scroll";
  import {getHomeMultidata, getHomeGoods} from "@/network/home";//axios

  export default {
    name: "Home",
    components: {
      Navigation,
      HomeBanners,
      HomeRecommdends,
      HomeFeature,
      TabControl,
      GoodsMain,
      Scroll,
      BackTop
    },
    data() {
      return {
        banners: [],
        recommdends: [],
        goods: {
          pop: {page: 0, list: []},
          new: {page: 0, list: []},
          sell: {page: 0, list: []},
        },
        tabControlState: 'pop',//商品拦状态
        isShowBackTopButton: false,//回顶按钮初始化状态
        goodsDataOffeTop: 0,//图片加载完时，商品栏的offeTop
        isShowFakeGoodsData: false,//是否展示假的商品栏
        leftY:0,//离开时的Y轴距离

      }
    },
    created() {
      this.getHomeMultidata()
      this.getHomeGoods("pop")
      this.getHomeGoods("new")
      this.getHomeGoods("sell")
      // console.log('HomeCreate')
    },
    mounted() {
      //加载完一张图片时就刷新scrollHeight
      const rsr = this.debounce(this.$refs.scrolls.refreshs, 100)
      this.$bus.$on('imageOnLoad', () => {
        rsr()
      })

    },
    methods: {
      //提交网络请求的方法
      getHomeMultidata() {
        return getHomeMultidata().then(res => {
          this.banners = res.data.data.banner.list
          this.recommdends = res.data.data.recommend.list
        })
      },
      getHomeGoods(type) {
        const index = this.goods[type].page + 1
        return getHomeGoods(type, index).then(res => {
          // console.log(res);
          this.goods[type].list.push(...res.data.data.list)
          this.goods[type].page++

          this.$refs.scrolls.finishPullUps()//重新定义底部的位置
        })
      },
      //点击切换数据的方法
      activeIndex(index) {
        // console.log(index);
        switch (index) {
          case 0 :
            this.tabControlState = 'pop'
            break
          case 1 :
            this.tabControlState = 'new'
            break
          case 2 :
            this.tabControlState = 'sell'
            break
        }
        //同步真假商品栏的选择状态，
        this.$refs.tabControl1.controlIndex = index
        this.$refs.tabControl2.controlIndex = index
      },
      //回到顶部的方法
      backTops() {
        // console.log('eee')
        this.$refs.scrolls.backTop(0, 0, 1000)//调用scroll的backTop方法
      },
      //回到顶部按钮的隐藏与显示
      scrollPostiton(position) {
        // console.log(position.y)
        //回顶按钮显与隐
        this.isShowBackTopButton = -position.y > 1000
        //假商品栏显与隐
        this.isShowFakeGoodsData = -position.y > this.goodsDataOffeTop
      },
      //下拉加载更多内容
      isPullingUp() {
        // console.log("eee")
        this.getHomeGoods(this.tabControlState)
        this.$refs.scrolls.refreshs()//重新计算高度
      },

      //防抖函数
      debounce(func, wait) {
        let timer;
        return function () {
          let argse = arguments
          if (timer) clearTimeout(timer)
          timer = setTimeout(() => {
            func.apply(this, argse)
          }, wait)
        }
      },
      //当轮换图加载完时
      homeBannerOnLoad() {
        //获取offsetTop，并保存
        // console.log(this.$refs.tabControl2.$el.offsetTop);
        this.goodsDataOffeTop = this.$refs.tabControl2.$el.offsetTop
      },

    },
    computed: {
      goodsState() {
        return this.goods[this.tabControlState].list
      }
    },
    destroyed() {
      // console.log("eee")
    },
    //活跃时
    activated() {
      // console.log("hhhhh")
      //根据保存y轴的位置以0秒的方式滚回去
      this.$refs.scrolls.backTop(0,this.leftY,.3)
      this.$refs.scrolls.refreshs()
    },
    //失活时
    deactivated() {
      //保存y轴位置
      this.leftY = this.$refs.scrolls.getY()
      // console.log(this.$refs.scrolls.scroll.y);
    },
  }
</script>

<style scoped>
  .home-nav {
    background-color: var(--color-tint);
    color: white;
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    z-index: 9;
  }

  #home{
    /*padding-top: 44px;*/
    height: 100vh;
    position: relative;
  }

  /*.tab-control {*/
  /*  position: sticky;*/
  /*  top: 44px;*/
  /*  z-index: 9;*/
  /*}*/

  /*.content{*/
  /*  height: calc(100% - 93px);*/
  /*  overflow: hidden;*/
  /*}*/


  .content {
    position: absolute;
    top: 44px;
    bottom: 49px;
    left: 0;
    right: 0;
    text-align: center;
  }

  /*给回到顶部按钮设置样式子*/
  .backtop {
    position: fixed;
    top: 87%;
    left: 82%;
  }

  /*设置假商品栏的样式*/
  .tab-controls {
    position: absolute;
    right: 0;
    left: 0;
    top: 44px;
    z-index: 9;
  }
</style>
