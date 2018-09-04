const path = require('path')
const { VueLoaderPlugin } = require('vue-loader');
const isDev = process.env.NODE_ENV === 'development'
const HTMLPlugin = require('html-webpack-plugin')
const webpack = require('webpack')

const config = {
    target: 'web',
    entry: path.join(__dirname, 'src/index.js'),
    output: {
      filename: 'bundle.js',
      path: path.join(__dirname, 'dist')
    },
    plugins: [
      new VueLoaderPlugin(),
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: isDev ? '"development"' : '"production"'
        }
      }),
      new HTMLPlugin()
    ],
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader'
        },
        {
          test: /\.jsx$/,
          loader: 'babel-loader'
        },
        {
          test: /\.css$/,
          use: [
            'style-loader',
            'css-loader'
          ]
        },
        {
          test: /\.styl$/,
          use: [
            'style-loader',
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: true,
              }
            },
            'stylus-loader'
          ]
        },
        {
          test: /\.(gif|jpg|jpeg|svg|png)$/,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 1024,
                name: '[name]-asm.[ext]'
              }
            }
          ]
        }
      ]
    }
}

if (isDev) {
  // 开发坏境的配置
  config.module.rules.push(
    {
      test: /\.styl$/,
      use: [
          'style-loader',
          'css-loader',
          {
              loader: 'postcss-loader',
              options: {
                  sourceMap: true
              }
          },
          'stylus-loader'
      ]
  },
 );
  config.devtool = "#cheap-module-eval-source-map"
  config.devServer = {
      port:8088,
      host:'0.0.0.0',
      overlay:{ 
          // webpack编译出现错误，则显示到网页上
          error:true,
      },
      hot:true//不刷新热加载数据
      //open:true//直接打开浏览器
  }
  config.plugins.push(
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin()
  )
}else{
  // 生产坏境的配置
  config.output.filename = '[name].[chunkhash:8].js';

  let extractLoader = {
      loader: MiniCssExtractPlugin.loader,
      options: {}
  }

  config.module.rules.push({
      test: /\.styl/,
       use: [
          extractLoader,
          'css-loader',
          {
              loader: 'postcss-loader',
              options: {
                  sourceMap: true
              }
          },
          'stylus-loader'
      ]
        },
      );
  config.plugins.push(
      new MiniCssExtractPlugin({
          //filename: "css/[name].[chunkhash:8].css"
          filename: "[name].[chunkhash:8].css"
      })  
  );
    //https://juejin.im/post/5af1677c6fb9a07ab508dabb
    //将类库文件单独打包出来
    config.optimization = {
      splitChunks: {
          chunks: 'async',// 必须三选一： "initial" | "all" | "async"(默认就是异步)
          // 大于30KB才单独分离成chunk
          minSize: 30000,
          maxAsyncRequests: 5,
          maxInitialRequests: 3,// 最大初始化请求书，默认1
          name: true,
          cacheGroups: {//设置缓存的 chunks
              default: {
                  priority: -20,
                  reuseExistingChunk: true,
              },
              vendors: {
                  name: 'vendors',    // 要缓存的 分隔出来的 chunk 名称
                  test: /[\\/]node_modules[\\/]/, //正则规则验证 符合就提取 chunk
                  priority: -10,      // 缓存组优先级
                  chunks: "all"       // 必须三选一： "initial" | "all" | "async"(默认就是异步)
              },
              
              echarts: {
                  name: 'echarts',
                  chunks: 'all',
                  // 对echarts进行单独优化，优先级较高
                  priority: 20,
                  test: function(module){
                      var context = module.context;
                      return context && (context.indexOf('echarts') >= 0 || context.indexOf('zrender') >= 0)
                  }
              }
          }
      }
      //单独打包 runtimeChunk
      ,runtimeChunk:{name: "manifest"}
      // 压缩代码
      ,minimizer: [
          // js mini
          new UglifyJsPlugin({
            cache: true,
            parallel: true,
            sourceMap: false // set to true if you want JS source maps
          }),
          // css mini
          new OptimizeCSSPlugin({})
      ]
  }
}


module.exports = config
// if (isDev) {
//   config.devtool = '#cheap-module-eval-source-map'
//   config.devServer = {
//     port: 8088,
//     host: '0.0.0.0',
//     overlay: {
//       errors: true,
//     },
//     hot: true
//   }
//   config.plugins.push(
//     new webpack.HotModuleReplacementPlugin(),
//     new webpack.NoEmitOnErrorsPlugin()
//   )
// }



