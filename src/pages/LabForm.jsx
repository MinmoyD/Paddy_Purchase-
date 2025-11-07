import React, { useState, useEffect } from "react";
import "./LabForm.css";

const InputField = ({ label, type = "text", name, value, onChange, readOnly }) => (
  <div className="form-group">
    <label>{label}</label>
    <input type={type} name={name} value={value} onChange={onChange} readOnly={readOnly} />
  </div>
);

const LabForm = ({ carNo, onSubmit }) => {
  const [formData, setFormData] = useState({
    carNo: carNo || "",
    siNo: "",
    paddyName: "",
    paddyMoisture: "",
    riceMoisture: "",
    paddyWeight: "",
    husk: "",
    bran: "",
    dust: "",
    ddc: "",
    paddyPercent: "",
    totalRice: "",
    huskToRice: "",
    totalHandRice: "",
    createdBy: "",
  });

  useEffect(() => {
    setFormData((prev) => ({ ...prev, carNo: carNo || "" }));
  }, [carNo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    onSubmit({ ...formData, [name]: value }); // send updates to parent
  };

  return (
    <div className="labform-container">
      <form className="labform-grid">
        <InputField label="Car Number" name="carNo" value={formData.carNo} readOnly={true} require/>
        <InputField label="SI No." type="number" name="siNo" value={formData.siNo} onChange={handleChange} require/>
        <InputField label="Paddy Name" name="paddyName" value={formData.paddyName} onChange={handleChange} type="text" require/>
        <InputField label="Paddy Moisture (%)" type="number" name="paddyMoisture" value={formData.paddyMoisture} onChange={handleChange} require/>
        <InputField label="Rice Moisture (%)" type="number" name="riceMoisture" value={formData.riceMoisture} onChange={handleChange} require/>
        <InputField label="Paddy Weight (Kg)" type="number" name="paddyWeight" value={formData.paddyWeight} onChange={handleChange} require/>
        <InputField label="Husk (%)" type="number" name="husk" value={formData.husk} onChange={handleChange} require/>
        <InputField label="Bran (%)" type="number" name="bran" value={formData.bran} onChange={handleChange} require/>
        <InputField label="Dust (%)" type="number" name="dust" value={formData.dust} onChange={handleChange} require/>
        <InputField label="DDC (%)" type="number" name="ddc" value={formData.ddc} onChange={handleChange} require/>
        <InputField label="Paddy (%)" type="number" name="paddyPercent" value={formData.paddyPercent} onChange={handleChange}  require/>
        <InputField label="Total Rice (%)" type="number" name="totalRice" value={formData.totalRice} onChange={handleChange} require/>
        <InputField label="Husk to Rice" type="number" name="huskToRice" value={formData.huskToRice} onChange={handleChange} require/>
        <InputField label="Total Hand Rice" type="number" name="totalHandRice" value={formData.totalHandRice} onChange={handleChange}  require/>
        <InputField label="Created By" name="createdBy" value={formData.createdBy} onChange={handleChange} require/>
      </form>
    </div>
  );
};

export default LabForm;
