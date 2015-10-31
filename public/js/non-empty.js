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



    if (e1 === "")
    {
        alert("Please input a Value for name");
        return false;
    }
    else if (e2 === "")
    {
        alert("Please input a Value for weight");
        return false;
    }
    else if (e3 === "")
    {
        alert("Please input a Value for height");
        return false;
    }else if (e4 === "")
    {
        alert("Please input a Value for date of birth");
        return false;
    }else if (e5 === "")
    {
        alert("Please input a Value for time of birth");
        return false;
    }else if (e6 === "")
    {
        alert("Please input a Value for religion");
        return false;
    }else if (e7 === "")
    {
        alert("Please input a Value for caste");
        return false;
    }else if (e8 === "")
    {
        alert("Please input a Value for industry");
        return false;
    }else if (e9 === "")
    {
        alert("Please input a Value for place of birth");
        return false;
    }else if (e10 === "")
    {
        alert("Please input a Value for current location");
        return false;
    }else if (e11 === "")
    {
        alert("Please input a Value for specialization");
        return false;
    }else if (e12 === "")
    {
        alert("Please input a Value for education");
        return false;
    }
    else if (e13 === "")
    {
        alert("Please input a Value for name for designation");
        return false;
    }
    else if (e14 === "")
    {
        alert("Please input a Value for name for current income");
        return false;
    }
    else if (e15 === "")
    {
        alert("Please input a Value for name for company");
        return false;
    }
    else
    {
        return true;
    }
}/**
 * Created by utkarsh on 10/31/2015.
 */
