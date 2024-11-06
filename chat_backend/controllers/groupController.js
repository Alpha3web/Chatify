const Group = require("../models/group");

exports.createGroup = async (req, res) => {
    try {
      const { name, description, members } = req.body;
      const avatar = `/uploads/${req.file.filename}`;  
      
      const newGroup = new Group({
        name,
        description,
        avatar,
        members: members.split(","),
      });
  
      await newGroup.save();
  
      res.status(201).json({
        message: 'Group created successfully',
        groupId: newGroup.id,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error creating group' });
    }
  };

  exports.getGroup = async (req, res) => {
    try {
      const groupId = req.params.groupId;
      const group = await Group.findById(groupId)
        .populate("members", "-password -__v")
        .exec();

      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }
      res.json(group);
    } catch (error) {
      res.status(501).json({ message: 'Error fetching group' });
    }
  }

  exports.getGroups = async (req, res) => {
    try {
      const userId = req.userId;
      const joinedGroups = await Group.find({members: userId})
        .select("_id name avatar")
      res.send(joinedGroups);
    } catch (error) {
      console.log(error);
    }
  }

