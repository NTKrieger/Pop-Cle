$(document).ready(function() {  
    //button handlers
    $("#getQuote").click(()=>{
        $.get("http://localhost:32000/quotation", function(data, status){
            console.log(data, status)
            $("#quotation").text(data)
        })
    })  
    $("#getName").click(()=>{
        $.get("http://localhost:32000/name", function(data, status){
            console.log(data, status)
            $("#attribution").text(data)
        })
    })
    $("#addName").click(()=>{
        let params = {
            name: $("#addNameInput").val()
        } 
        $.post("http://localhost:32000/name", params, function(data, status){
            console.log(data, status)
        })
    })
});