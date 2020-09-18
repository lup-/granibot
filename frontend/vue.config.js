module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  "configureWebpack": {
    "devtool": 'eval-source-map',
    "optimization": {
      "splitChunks": false
    }
  }
}