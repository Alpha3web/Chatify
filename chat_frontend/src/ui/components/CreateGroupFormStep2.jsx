import { useState, useEffect } from 'react';
import { List, ListItem, ListItemAvatar, ListItemText, Avatar, Checkbox, ListItemButton } from '@mui/material';
import { fetchUsers } from '../../lib/api';

const CreateGroupFormStep2 = ({ onNext, onPrev, prevData }) => {
  const [members, setMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState(prevData?.selectedMembers || []);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const getUsers = async () => {
      const users = await fetchUsers();
      setMembers(users);
    }

    try {
      getUsers();
    } catch (error) {
      setErrors(error)
    }
  }, []);

  const handleMemberSelect = ({ userId }) => {
    setSelectedMembers((prevMembers) => [...prevMembers, userId]);
  };

  const handleMemberDeselect = ({userId}) => {
    setSelectedMembers((prevMembers) => prevMembers.filter((m) => m !== userId));

  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Proceed to Step 3
      onNext({ selectedMembers });
    } catch (error) {
      setErrors(error.response.data);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='step-2'>
      <label>Select Members:</label>
      <List dense sx={{ width: '90%', bgcolor: 'background.paper', m: "10px 20px"}}>
        {members.map(member => {
          const labelId = `checkbox-list-secondary-label-${member.userId}`;
          return (
            <ListItem
              key={member.userId}
              secondaryAction={
                <Checkbox
                  edge="end"
                  onChange={e => e.target.checked ? handleMemberSelect(member) : handleMemberDeselect(member) }
                  checked={selectedMembers.includes(member.userId)}
                  inputProps={{ 'aria-labelledby': labelId }}
                />
              }
              disablePadding
            >
              <ListItemButton>
                <ListItemAvatar>
                  <Avatar alt='smart splendid' src='/profile-image.jpg' />
                </ListItemAvatar>
                <ListItemText id={labelId} primary={member.username} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      {errors.members && <p style={{ color: 'red' }}>{errors.members}</p>}
      <div className="btn-div">
        <button type='button' onClick={onPrev} className="btn-prev">Prev</button>
        <button type="submit" className="btn-next">Next</button>
      </div>
    </form>
  );
};

export default CreateGroupFormStep2;