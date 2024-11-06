import React, { useState } from 'react';

const CreateGroupFormStep1 = ({ onNext, prevData }) => {
  const [groupName, setGroupName] = useState(prevData.groupName || "");
  const [groupDescription, setGroupDescription] = useState(prevData.groupDescription || "");
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate group name and description
      const validationErrors = {};
      if (!groupName) validationErrors.name = 'Group name is required';
      if (!groupDescription) validationErrors.description = 'Group description is required';
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
      // Proceed to Step 2
      onNext({ groupName, groupDescription });
    } catch (error) {
      setErrors(error.response.data);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='step-1'>
      <div>
        <label>Group Name:</label>
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Enter group name"
        />
        {errors.name && <p style={{ color: 'red' }}>{errors.name}</p>}
      </div>

      <div>
        <label>Group Description:</label>
        <textarea
          value={groupDescription}
          onChange={(e) => setGroupDescription(e.target.value)}
          placeholder="Enter group description"
        />
        {errors.description && <p style={{ color: 'red' }}>{errors.description}</p>}
      </div>

      <div  className="btn-div">
        <button type="submit" className='btn-next'>Next</button>
      </div>
    </form>
  );
};

export default CreateGroupFormStep1;