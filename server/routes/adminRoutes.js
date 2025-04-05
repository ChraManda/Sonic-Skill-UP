const mongoose = require("mongoose");
const Admin = mongoose.model("Admin");

module.exports = (app) => {
    //Admin Registration
    app.post("/api/v1/admin/register", async (req, res) =>{
    console.log("Register Admin");
    const {email, password, createdAt} = req.body;
    try {
        const admin = await Admin.findOne({email});
            if (admin){
                return res.status(400).json({message: "Admin already exists!"});
            }
            const adminFields = {email, password, createdAt};
            const response = await Admin.create(adminFields);
            res.status(201).json({message: "Admin Created Successfuly", response});
            console.log(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: error.message});
    }
    });
    
   
    //Search Admin
    app.get("/api/v1/get/admin/:id", async (req, res) => {
        const {id} = req.params;
        try {
            const response = await Admin.findById(id);
            res.status(200).json({message: "Admin fetched successfully", response})

        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
        }
    });


//   // Get All Admins
     app.get("/api/v1/get/admins", async (req, res) =>{
        try {
            const response = await Admin.find().select("email createdAt");
            res.status(200).json({message: "Users fetched sucessfully", response});
        
        } catch (error) {
          console.log(error);
          res.status(500).json({ message: error.message });  
        }
     })

//   // Update Admin Info
    app.put("/api/v1/update/admin/:id", async (req, res) => {
        const {id} = req.params;
        const {email, password} = req.body;
        try {
            const response = await Admin.updateOne({_id: id}, {email, password});
            res.status(200).json({message: "Admin Updated Successfully", response});
        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
        }
    })

//   // Delete Admin
    app.delete("/api/v1/delete/admin/:id", async (req, res) =>{
        const {id} = req.params;
        try {
            const response = await Admin.findByIdAndDelete({_id:id});
            res.status(201).json({message: "Admin Deleted Successfully", response});
        } catch (error) {
            console.log(error);
            res.status(201).json({message: error.message});
        }
    })

    //   // Update user Info
app.put("/api/v1/update/user/:id", async (req, res) => {
    const { id } = req.params;
    const { email, password, userName } = req.body;

    try {
        const updates = {};
        if (email) updates.email = email;
        if (password) updates.password = await bcrypt.hash(password, 10); 
        if (userName) updates.userName = userName;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "No valid fields to update" });
        }

        const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User updated successfully", user: updatedUser });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

     // Delete User
     app.delete("/api/v1/delete/user/:id", async (req, res) =>{
        const {id} = req.params;
        try {
            const response = await User.findByIdAndDelete({_id:id});
            res.status(201).json({message: "user Deleted Successfully", response});
        } catch (error) {
            console.log(error);
            res.status(201).json({message: error.message});
        }
    })

}