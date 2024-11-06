import React, { useRef, useState } from 'react';
import { Avatar } from '@mui/material';
import { createNewGroup } from '../../lib/api';

const CreateGroupFormStep3 = ({onPrev, groupData}) => {
  const [groupAvatar, setGroupAvatar] = useState(null);
  const [errors, setErrors] = useState({});
  const dropZoneRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create group
      const formData = new FormData();
      formData.append('avatar', groupAvatar);
      formData.append("description", groupData.groupDescription);
      formData.append("name", groupData.groupName);
      formData.append("members", groupData.selectedMembers);
      
      const response = await createNewGroup(formData);
      console.log(response);
    } catch (error) {
      setErrors(error);
    }
    
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const selectedFile = e.dataTransfer.files[0];
    setGroupAvatar(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    dropZoneRef.current.style.border = '2px dashed #aaa';
  };

  return (
    <form onSubmit={handleSubmit} className="step-3">
      <div 
      style={{width: "90%", height: "200px", display: "flex", justifyContent: "center", alignItems: "center", margin: "10px auto"}}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      ref={dropZoneRef}
      >
        {groupAvatar? <Avatar sx={{width: 150, height: 150}} alt='group avatar' src={URL.createObjectURL(groupAvatar)} /> : <p>Drag and drop here</p>}
      </div>
      <label style={{color: "black"}} htmlFor='input'>{groupAvatar? "Change image" : "Choose image"}</label>
        <input
          id='input'
          style={{margin: "10px"}}
          type="file"
          accept='image/*'
          onChange={(e) => setGroupAvatar(e.target.files[0])}
        />
        {errors.avatar && <div style={{ color: 'red' }}>{errors.avatar}</div>}

      <div className="btn-div">
        <button onClick={onPrev} type='button' className="btn-prev">Prev</button>
        <button type="submit" className="btn-next">Create Group</button>
      </div>

    </form>
  );
};

export default CreateGroupFormStep3;