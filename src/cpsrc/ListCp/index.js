require("./index.scss");
ListCp = React.createClass({
    //初始状态，初始基础属性
    getInitialState: function() {
        return{
            //属性状态包括日期 加载状态，标签，参数（这个是干嘛用的）
            data:null,
            loading:true,
            tag:null,
            //？？？
            parameter:{cmd: "list", page: "1", item: 18, by: "download", order: "down"}
        };
    },
    //react中will 函数在进入状态之前调用，did 函数在进入状态之后调用
    // 一旦你的组件已经运行了 render 函数，并实际将组件渲染到了 DOM 中，componentDidMount 就会被调用。
    componentDidMount:function(){
        this._loadSongsData(this.state.parameter);
        var self = this;
        //？？？？？？
        EventEmitter.subscribe("clickTag", function(data) {
            //console.log(data);
            self.state.tag = data;
            self.state.parameter.page = 1;
            self.state.parameter.range = "tag";
            self.state.parameter.keyword = self.state.tag;
            self._loadSongsData(self.state.parameter);
        });
        EventEmitter.subscribe("defaultClickTag", function() {
            //console.log("defaultClickTag");
            self.state.tag = null;
            self.state.parameter = {cmd: "list", page: 1, item: 18, by: "download", order: "down"};
            self._loadSongsData(self.state.parameter);
        });
    },
    //在这render部分，所有的html部分和样式添部分都在这里完成
    render:function(){
        //console.log(this.state);
        //文件存储基础路径
        var filebase = this.props.api+"?cmd=file&name=";
        
        //state中保留json字符串，实际使用时将其转成对象
        var data = JSON.parse(this.state.data);
        //console.log(data);
        var songData = new Array();
        var pageData = new Array();
        var pageTitle = "最新更新";
        var loadingClass = "";
        var errorClass = "";
        var titleTotal="";
        
        if(this.state.tag!=null){
            pageTitle = this.state.tag+"/"+pageTitle;
        }
        if(data&&data.STATUS=="[I]OK"){
            titleTotal = "("+data.CURRENTPAGE+"/"+data.TOTALPAGE+")";
            for(var i=0;i<data.COUNTPERPAGE;i++){
                songData.push(data[i]);
            }
            //console.log(songData);
            //console.log(data.CURRENTPAGE);
            //console.log(pageData);
            pageData = this._makePageData(data,10);
        }else{
            errorClass = "error";    
        }
        //在这对每一首歌进行包装，重新组成一个新的数组
        var songs = songData.map(function(song) {
          return   <div key={song.ID} className="col-xs-6 col-sm-4 col-md-3 col-lg-2">
                      <div className="item" data-sm={song.ID}>

                        <div className="pos-rlt">

                          <div className="item-overlay opacity r r-2x bg-black play ">
                              <div className="center text-center m-t-n">
                                  <a href="#" data-toggle="class" >
                                    <i className=" fa  icon-control-play  i-2x play text"></i>
                                      <i className="icon-control-pause i-2x text-active"></i>
                                  </a>
                              </div>
                              <div className="bottom padder m-b-sm">
                                  <a href="#" className="pull-right" data-toggle="class">
                                      <i className="fa fa-heart-o text"></i>
                                      <i className="fa fa-heart text-active text-danger"></i>
                                  </a>
                              </div>
                          </div>

                            <a href="#"><img src={filebase+song.ID+".jpg"} alt="" className="cover r r-2x img-full"/></a>
                        </div>

                        <div className="padder-v">
                          <a href="#" data-bjax data-target="#bjax-target" data-el="#bjax-el" data-replace="true" className="title text-ellipsis">{song.TITLE}</a>
                          <a href="#" data-bjax data-target="#bjax-target" data-el="#bjax-el" data-replace="true" className="author text-ellipsis text-xs text-muted">{song.AUTHOR}</a>
                        </div>
                      </div>
                    </div>;
        });
        var pages = pageData.map(function(page){
            return <li key={page.page} className={page.className}><a data-page={page.page} href="#" className="numPage">{page.text}</a></li>;
        });
        //console.log(pages);
        //为loading状态添加样式
        if(this.state.loading){
            loadingClass = "loading";
        }else{
            loadingClass = "loaded";
        }
        //console.log(loadingClass);
        return <section className={"hbox stretch "+loadingClass+" "+errorClass}>
                <section>
                  <section className="vbox">
                    <section className="scrollable padder-lg">
                      <h2 className="font-thin m-b ">{pageTitle} <h3>{titleTotal}</h3></h2>
                      <div onClick={this.handleSongClick} className="row row-sm">
                          {songs}
                      </div>

                      <ul onClick={this.handlePageClick} className="pagination pagination">
                        <li className="prePageLi"><a href="#" className="prePage"><i className="fa fa-chevron-left"></i></a></li>
                        {pages}
                        
                        <li className="nextPageLi"><a href="#" className="nextPage"><i className="fa fa-chevron-right"></i></a></li>
                      </ul>
                    </section>                    
                  </section>
                </section>
              </section>;
    },
    _makePageData:function(data,beShowPageNum){
        beShowPageNum = beShowPageNum - 2;
        var pageData = new Array();
        //对于首页的处理
        if(data.CURRENTPAGE==1){
           pageData.push({text:"首页","page":1,"className":"first active"});  
        }else{
           pageData.push({text:"首页","page":1,"className":"first"});
        }

        //中间显示几页处理
        var startPage = parseInt(data.CURRENTPAGE) - Math.floor(beShowPageNum/2);
        //最小显示正数第二页
        if(startPage<=1){
            startPage = 2;
        }
        //最大显示到数第二页
        var endPage = parseInt(data.CURRENTPAGE) + Math.floor(beShowPageNum/2);
        if(endPage >= data.TOTALPAGE-1){
            endPage = data.TOTALPAGE-1;
        }

        for(var i =startPage;i<=endPage;i++){
            if(i == data.CURRENTPAGE){
               pageData.push({"text":i,"page":i,"className":"active"});   
            }else{
               pageData.push({"text":i,"page":i,"className":""});
            }
        }
        //不足补充(有BUG)
        /*
        console.log(pageData.length,beShowPageNum + 1);
        if(pageData.length < beShowPageNum + 1){
            var addnum = (beShowPageNum + 1)-pageData.length;
            //正向补充
            var lastpage = pageData[pageData.length-1].page;
            if(lastpage <= parseInt(data.TOTALPAGE) - Math.floor(beShowPageNum/2)){
                for(var i=lastpage+1;i<=lastpage+addnum;i++){
                    if(i == data.CURRENTPAGE){
                       pageData.push({"page":i,"className":"active"});   
                    }else{
                       pageData.push({"page":i,"className":""});
                    }   
                }
                console.log("正向补充");
            }else{
                var firstPage = pageData[1];
                for(var i = firstPage.page -1;i>=firstPage.page - addnum;i--){
                    if(i == data.CURRENTPAGE){
                       pageData.push({"page":i,"className":"active"});   
                    }else{
                       pageData.push({"page":i,"className":""});
                    }
                }
                //按照page排序
                pageData.sort(function(a,b){
                    if(a.page > b.page){
                        return 1;
                    }
                    if(a.page == b.page){
                        return 0;
                    }
                    if(a.page < b.page){
                        return -1;
                    }
                });
                console.log("反向补充");
            }
            //反向补充

        }
        */
        //对于尾页的处理
        if(data.CURRENTPAGE==data.TOTALPAGE){
           pageData.push({"page":data.TOTALPAGE,"text":"尾页","className":"last active"});  
        }else{
           pageData.push({"page":data.TOTALPAGE,"text":"尾页","className":"last"});
        }
        return pageData;
    },
    //加载歌曲数据，设置加载状态 jquery ajax学习
    _loadSongsData:function(parameter){
        this.setState({
            loading:true
        });
        var self = this;//好处在哪？
        //jquery中的ajax ，$.done 成功时执行，异常时不会执行。
        var promise = $.get(this.props.api,parameter);
        //改变属性
        promise.done(function(data){
            self.setState({
                data:data,
                loading:false
            });
        });
       // console.log(promise);
    },
    //处理点击歌曲事件
    handleSongClick:function(event){
        event.preventDefault();
        var filebase = this.props.api+"?cmd=file&name=";
        var $target = $(event.target);
        var $item = $($target.parents("div.item")[0]);
        if($target.hasClass("active")){


        }
        else{
        if($target.hasClass("play")||$target.hasClass("title")){
            console.log($target[0]);
            var sm = $item.attr("data-sm");
            var title = $item.find(".title").text();
            var author = $item.find(".author").text();
            var cover = $item.find(".cover").attr("src");
            $("div").find(".active").removeClass("active");
            $($item[0]).find(".play").addClass("active");
            EventEmitter.dispatch("playSong", { "title":title,"author":author,"cover":cover,"file":filebase+sm+".mp3"});

        }}

        function addToMyPlaylist(title,author,cover,href,isplay){
              //当前播放列表去重复
              for(i in myPlaylist.playlist){
                  var item = myPlaylist.playlist[i];
                  //找到重复
                  if(item.mp3 == href || item.title == title){
                      //播放列表中已经存在的这首歌
                      if(isplay){
                         //注意for in 语法的key是字符串
                         //会影响jplist
                         myPlaylist.play(parseInt(i));
                         return true;
                      }else{
                        return false;
                      }
                  }
              }
              //向jplayer播放列表中添加新歌曲
              myPlaylist.add({
                    title:title,
                    artist:author,
                    poster:cover,
                    mp3:href
              });
              if(isplay){
                myPlaylist.play($("#jp-playlist ul").length-1);
              }
            return true;
        }
    },
    handlePageClick:function(evnet){
        evnet.preventDefault();
        var $target =  $(evnet.target);
        if($target.hasClass("prePage")||$target.parent().hasClass("prePage")){
            var data = JSON.parse(this.state.data);
            var page = parseInt(data.CURRENTPAGE)-1;
            if(page <= 0){
                return false;
            }
            
            this.state.parameter.page = page;
            this._loadSongsData(this.state.parameter);
            return true;
        }
        if($target.hasClass("nextPage")||$target.parent().hasClass("nextPage")){
            var data = JSON.parse(this.state.data);
            var page = parseInt(data.CURRENTPAGE)+1;
            if(page > data.TOTALPAGE){
                return false;
            }
            this.state.parameter.page = page;
            this._loadSongsData(this.state.parameter);
            return true;
        }
        if($target.hasClass("numPage")){
            var page = parseInt($target.attr("data-page"));
            this.state.parameter.page = page;
            this._loadSongsData(this.state.parameter);
            return true;
        }
    }
});