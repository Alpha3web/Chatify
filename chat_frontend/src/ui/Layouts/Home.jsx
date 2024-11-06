import MoreVertIcon from '@mui/icons-material/MoreVert';
import FilterListIcon from '@mui/icons-material/FilterList';
// import { Avatar, TextField } from '@mui/material';
import ChatWindow from '../components/ChatWindow';
import { Outlet } from 'react-router-dom';
import SidePanel from '../components/SidePanel';
import { TextField } from '@mui/material';



const HomeLayout = () => {

  return (
    <div className="container">
      <SidePanel />
      <div className="chats">
        <div className="chats-header">
          <h2>Chats</h2>
          <FilterListIcon />
          <MoreVertIcon />
        </div>
        <div style={{ width: "90%", margin: "auto" }}>
          <TextField type="search" label="search field" variant="standard" color='success' fullWidth sx={{
            '& .MuiInputBase-root': {
              color: '#f7f7f7',
            },
            '& .MuiFormLabel-root': {
              color: '#f7f7f7', 
              fontSize: '16px', 
              fontFamily: 'Arial',
            },
            '& .MuiFormLabel-root.Mui-focused': {
              color: '#f7f7f7', 
            },
            '& .MuiInput-underline': {
              '&:before': {
                borderColor: '#f7f7f7', 
              },
            },
          }} />
        </div>
        <Outlet />
      </div>
      
      <ChatWindow />

    </div>

  )
}

export default HomeLayout;