$(document).ready(function(){
    function formatMessage(name, msg, partial){
      var clas = name;
      if(partial){
        clas += ' partial';
      }
      var temp = "<li class='"+clas+"'><b>"+name+": </b><span class='msg'>"+msg+"</span></li>";
      return temp;
    }
    
    var socket = io.connect('http://localhost:4000');

    socket.on('connect', function(data){
      nickname = prompt("What's your nickname?");
      socket.emit("join", nickname);
      $("#messages").append(formatMessage("Status", 
              "Logged in as <b>"+nickname+"</b>", 0));
      $("#usersList").append("<li><b>"+nickname+"</b></li>");
    });

    socket.on('status', function(data){
      if(data.status == 'connected'){
        $("#usersList").append("<li>"+data.name+"</li>");
        $("#messages").append(formatMessage('Status', 
                                            '<b>'+data.name + '</b> is in da house.'));
      }
      if(data.status == 'disconnect'){
        $("#messages").append(formatMessage('Status', 
                                            '<b>'+data.name + '</b> is gone.'));
        $("#usersList li:contains('"+data.name+"')").remove();
      }
    });
    
    socket.on('message', function(data){
      var partials = $("#messages li.partial."+data.name);
      partials.children('.msg').text(data.msg);
      partials.removeClass("partial");
    });

    socket.on('partial', function(data){
      var partials = $("#messages li.partial."+data.name);
      if(data.msg == ''){
        if(partials.length)
          partials.remove();
      }else{
        if(partials.length){
          partials.children('.msg').text(data.msg);
        }else{
          $("#messages").append(formatMessage(data.name, 
                                              data.msg,
                                              true));
        }
      }
    });

    $("#writer").keyup(function(){
      var msg = $("#writer").val();
      socket.emit('partial', msg);
    });
    
    $("#writerForm").submit(function(e){
      var msg = $("#writer").val();
      if(msg != ''){
        var message = {msg: msg};
        socket.emit('message', message);
        $("#writer").val('');
        $("#messages").append(formatMessage("me", msg));
      }
      return false;
    });
  
});
