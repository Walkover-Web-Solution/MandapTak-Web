function required()
{
    var e1=document.getElementById("name").value;
    var e2=document.getElementById("weight").value;
    var e3=document.getElementById("height").value;
    var e4=document.getElementById("dob").value;
    var e5=document.getElementById("tob").value;
    var e6=document.getElementById("rel").value;
    var e7=document.getElementById("caste").value;
    var e8=document.getElementById("work").value;
    var e9=document.getElementById("bp").value;
    var e10=document.getElementById("cl").value ;
    var e11=document.getElementById("spe").value ;
    var e12=document.getElementById("edu").value ;
    var e13=document.getElementById("desig").value;
    var e14=document.getElementById("income").value;
    var e15=document.getElementById("comp").value ;
    var error="Please input value for ";
    var boolValue=true;
    if (e1 == "" || e1=="undefined")
    {
        error+="Name";
        boolValue=false;
    }
    if (e2 == "")
    {
        if(error!="")error+=",";
        error+=" Weight";
        boolValue=false;
    }
    if (e3 == "")
    {
        if(error!="")error+=",";
        error+=" Height";
        boolValue= false;
    }
    if (e4 == "")
    {
        if(error!="")error+=",";
        error+=" Date of Birth";
        boolValue=false;
    }
    if (e5 == "")
    {
        if(error!="")error+=",";
        error+=" Time of Birth";
        boolValue=false;
    }
    if (e6 == "")
    {
        if(error!="")error+=",";
        error+=" Religion";
        boolValue=false;
    }
    if (e7 == "")
    {
        if(error!="")error+=",";
        error+=" Caste";
        boolValue=false;
    }
    if (e8 == "")
    {
        if(error!="")error+=",";
        error+=" Industry";
        boolValue=false;
    }
    if (e9 == "")
    {
        if(error!="")error+=",";
        error+=" Place of Birth";
        boolValue=false;
    }
    if (e10 == "")
    {
        if(error!="")error+=",";
        error+=" Current Location";
        boolValue=false;
    }
    if (e11 == "")
    {
        if(error!="")error+=",";
        error+=" Specialization";
        boolValue=false;
    }
    if (e12 == "")
    {
        if(error!="")error+=",";
        error+=" Education";
        boolValue=false;
    }
    if (e13 == "" || e13=="undefined")
    {
        if(error!="")error+=",";
        error+=" Designation";
        boolValue=false;
    }
    if (e14 == "")
    {
        if(error!="")error+=",";
        error+=" Current Income";
        boolValue= false;
    }
    if (e15 == "" || e15=="undefined")
    {
        if(error!="")error+=",";
        error+=" Company";
        boolValue=false;
    }
    if(error!="")error+=".";
    if(boolValue==false)
    {
        window.alert(error);
    }
    return boolValue;
}/**
 * Created by utkarsh on 10/31/2015.
 */
