import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { getVendorRegistrationCategories } from "../../services/api";
import { digitsOnly, readDraft, saveDraft, STEP1_KEY } from "./vendorRegistrationUtils";
import "./VendorRegistration.css";

export default function VendorRegistrationStep1(){
 const navigate=useNavigate();
 const [form,setForm]=useState(()=>readDraft(STEP1_KEY,{businessName:"",categoryId:"",categoryName:"",ownerName:"",mobileNumber:"",postalCode:""}));
 const [categories,setCategories]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(""),[errors,setErrors]=useState({});
 const loadCategories=useCallback(async()=>{try{setLoading(true);setError("");const response=await getVendorRegistrationCategories();setCategories(response?.data?.categories||[]);}catch(e){setError(e?.message||"Categories could not be loaded.");}finally{setLoading(false);}},[]);
 useEffect(()=>{loadCategories();},[loadCategories]);
 const change=(name,value)=>{setForm(p=>({...p,[name]:value}));setErrors(p=>({...p,[name]:""}));};
 const next=(e)=>{e.preventDefault();const x={};if(form.businessName.trim().length<2)x.businessName="Enter a valid business name.";if(!form.categoryId)x.categoryId="Select a category.";if(form.ownerName.trim().length<2)x.ownerName="Enter the owner name.";if(!/^[6-9]\d{9}$/.test(form.mobileNumber))x.mobileNumber="Enter a valid 10-digit mobile number.";if(!/^[1-9]\d{5}$/.test(form.postalCode))x.postalCode="Enter a valid 6-digit pincode.";setErrors(x);if(Object.keys(x).length)return;const category=categories.find(c=>String(c.id)===String(form.categoryId));const data={...form,businessName:form.businessName.trim(),ownerName:form.ownerName.trim(),categoryName:category?.name||""};saveDraft(STEP1_KEY,data);navigate("/vendor-registration/contact");};
 return <main className="vr-page"><section className="vr-frame"><header className="vr-header"><button className="vr-back" onClick={()=>navigate("/dashboard")}><FiArrowLeft/></button><h1>New Vendor</h1><span/></header><div className="vr-content"><div className="vr-progress-label"><span>Step 1 of 3</span><span>Business Info</span></div><div className="vr-progress"><span style={{width:"33.333%"}}/></div><form className="vr-card" onSubmit={next}>
 <label className={`vr-field ${errors.businessName?"invalid":""}`}>Business Name<input value={form.businessName} onChange={e=>change("businessName",e.target.value)} placeholder="e.g. Home Cleaning" maxLength={150}/>{errors.businessName&&<small className="vr-error">{errors.businessName}</small>}</label>
 <label className={`vr-field ${errors.categoryId?"invalid":""}`}>Category<select value={form.categoryId} onChange={e=>change("categoryId",e.target.value)} disabled={loading}><option value="">{loading?"Loading categories...":"Select a category"}</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>{errors.categoryId&&<small className="vr-error">{errors.categoryId}</small>}</label>
 {error&&<div className="vr-message">{error} <button type="button" onClick={loadCategories}>Retry</button></div>}
 <label className={`vr-field ${errors.ownerName?"invalid":""}`}>Owner Name<input value={form.ownerName} onChange={e=>change("ownerName",e.target.value)} placeholder="e.g. Vishwas" maxLength={255}/>{errors.ownerName&&<small className="vr-error">{errors.ownerName}</small>}</label>
 <label className={`vr-field ${errors.mobileNumber?"invalid":""}`}>Mobile Number<div className="vr-phone"><span>+91</span><input value={form.mobileNumber} onChange={e=>change("mobileNumber",digitsOnly(e.target.value,10))} inputMode="numeric" placeholder="9876543210"/></div>{errors.mobileNumber&&<small className="vr-error">{errors.mobileNumber}</small>}</label>
 <label className={`vr-field ${errors.postalCode?"invalid":""}`}>Pincode / Location<input value={form.postalCode} onChange={e=>change("postalCode",digitsOnly(e.target.value,6))} inputMode="numeric" placeholder="e.g. 500081"/>{errors.postalCode&&<small className="vr-error">{errors.postalCode}</small>}</label>
 <button className="vr-primary vr-full">Next <FiArrowRight/></button></form></div></section></main>;
}
