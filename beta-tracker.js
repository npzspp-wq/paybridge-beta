(function(){
  var KEY='pb_beta';
  var ENDPOINT='https://paybridge-analytics.npzspp.workers.dev/event';

  function saveLocal(type,data){
    try{
      var rows=JSON.parse(localStorage.getItem(KEY)||'[]');
      rows.push({type:type,time:new Date().toISOString(),data:data||{}});
      localStorage.setItem(KEY,JSON.stringify(rows.slice(-200)));
      return true;
    }catch(e){
      return false;
    }
  }

  function sendAggregate(type,data){
    try{
      var d=data||{};
      var from=String(d.from||'').slice(0,20);
      var to=String(d.to||'').slice(0,20);
      var provider=String(d.provider||'').slice(0,50);
      var source=[from&&to?from+' -> '+to:'',provider].filter(Boolean).join(' | ');
      fetch(ENDPOINT,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          type:String(type||'').slice(0,50),
          source:source||'paybridge-beta',
          currency:String(d.currency||'').slice(0,10)
        }),
        keepalive:true
      }).catch(function(){});
    }catch(e){}
  }

  window.PaybridgeBeta={
    save:function(type,data){
      var ok=saveLocal(type,data);
      if(type==='compare'||type==='route') sendAggregate(type,data);
      return ok;
    },
    summary:function(){
      try{
        var rows=JSON.parse(localStorage.getItem(KEY)||'[]');
        return{
          comparisons:rows.filter(function(x){return x.type==='compare'}).length,
          routes:rows.filter(function(x){return x.type==='route'}).length
        };
      }catch(e){
        return{comparisons:0,routes:0};
      }
    }
  };
})();
