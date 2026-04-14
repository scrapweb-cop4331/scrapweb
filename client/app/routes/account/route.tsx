import { useState, useEffect } from "react";
import { Modal, Button, Input, TitleBar } from "@react95/core";
import { auth } from "~/lib/auth";
import { updateUser } from "~/lib/api";

export default function AccountRoute() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    firstName: "",
    lastName: "",
    username: "",
    email: "",
  });

  useEffect(() => {
    const user = auth.loadUser();
    if (user) {
      setFormData({
        id: user.id || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        username: user.username || "",
        email: user.email || "",
      });
    }
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const success = await updateUser(
        formData.id,
        formData.firstName,
        formData.lastName,
        formData.username,
        formData.email,
      );

      if (success) {
        const currentUser = auth.getUser();
        if (currentUser) {
          auth.saveUser({
            ...currentUser,
            ...formData,
          });
        }
        setIsEditing(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const fieldStyle = {
    width: "100%",
    backgroundColor: isEditing ? "white" : "transparent",
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Modal
        title="Account Settings"
        style={{ width: "350px" }}
        titleBarOptions={
          <TitleBar.Close onClick={() => window.history.back()} />
        }
      >
        <div
          style={{
            padding: "15px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "12px" }}>User ID:</label>
            <Input
              value={formData.id}
              readOnly={true}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, id: e.target.value })
              }
              style={fieldStyle}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "12px" }}>First Name:</label>
            <Input
              value={formData.firstName}
              readOnly={!isEditing}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              style={fieldStyle}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "12px" }}>Last Name:</label>
            <Input
              value={formData.lastName}
              readOnly={!isEditing}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              style={fieldStyle}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "12px" }}>Username:</label>
            <Input
              value={formData.username}
              readOnly={!isEditing}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, username: e.target.value })
              }
              style={fieldStyle}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "12px" }}>Email:</label>
            <Input
              value={formData.email}
              readOnly={!isEditing}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, email: e.target.value })
              }
              style={fieldStyle}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "8px",
              marginTop: "8px",
            }}
          >
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                style={{ width: "80px" }}
              >
                Edit
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  style={{ width: "80px" }}
                >
                  {loading ? "..." : "Save"}
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  style={{ width: "80px" }}
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
