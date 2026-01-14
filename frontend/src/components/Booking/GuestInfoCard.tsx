import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  CircularProgress,
  TextField,
  Button,
  Alert,
} from "@mui/material";
import axios from "axios";

interface ProfileData {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

interface GuestInfoCardProps {
  profileData: ProfileData | null;
  loading: boolean;
  onProfileUpdate: (updatedProfile: ProfileData) => void;
  onEditingChange?: (isEditing: boolean) => void;
}

/**
 * Guest Information Card Component
 *
 * Displays guest information from authenticated user account.
 * Shows input fields if firstName, lastName, or phoneNumber are missing.
 * Allows editing with an "Edit" button if data already exists.
 * Updates user profile in database on save.
 */
function GuestInfoCard({ profileData, loading, onProfileUpdate, onEditingChange }: GuestInfoCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<ProfileData | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Check if profile data is incomplete (missing required fields)
  // Note: phoneNumber is optional, only firstName and lastName are required
  const isIncomplete = profileData && (!profileData.firstName || !profileData.lastName);

  // Automatically enter edit mode if data is incomplete
  const showEditMode = isEditing || isIncomplete;

  // Notify parent when in edit mode (either manual or auto-edit)
  useEffect(() => {
    if (onEditingChange) {
      onEditingChange(!!showEditMode);
    }
  }, [showEditMode, onEditingChange]);

  const handleEdit = () => {
    setEditData(profileData);
    setIsEditing(true);
    setError(null);
    setSuccess(false);
    // Notify parent that editing has started
    onEditingChange?.(true);
  };

  const handleCancel = () => {
    // Only allow cancel if profile is complete (not in auto-edit mode)
    if (!isIncomplete) {
      setIsEditing(false);
      setEditData(null);
      setError(null);
      // Notify parent that editing has ended
      onEditingChange?.(false);
    }
  };

  const handleChange = (field: keyof ProfileData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditData(prev => prev ? { ...prev, [field]: e.target.value } : null);
  };

  const handleSave = async () => {
    if (!editData || !profileData?.id) {
      setError("Cannot update: User ID missing");
      return;
    }

    // Validation
    if (!editData.firstName.trim() || !editData.lastName.trim()) {
      setError("First name and last name are required");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem("token");
      const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

      const response = await axios.put(
        `${baseURL}/users/${profileData.id}`,
        {
          firstName: editData.firstName,
          lastName: editData.lastName,
          phoneNumber: editData.phoneNumber,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update parent component state
      onProfileUpdate({
        ...editData,
        id: response.data.id,
        email: response.data.email,
      });

      setSuccess(true);
      setIsEditing(false);
      setEditData(null);
      // Notify parent that editing has ended
      onEditingChange?.(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const dataToDisplay = showEditMode && editData ? editData : profileData;

  if (loading) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <CircularProgress size={20} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!profileData) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant='body2' color='text.secondary'>
            Unable to load guest information
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Initialize edit data when entering edit mode
  if (showEditMode && !editData) {
    setEditData(profileData);
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant='h6' gutterBottom>
          Guest Information
        </Typography>

        {/* Success Message */}
        {success && (
          <Alert severity='success' sx={{ mb: 2 }}>
            Profile updated successfully!
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Missing Info Warning */}
        {isIncomplete && !isEditing && (
          <Alert severity='info' sx={{ mb: 2 }}>
            Please complete your profile information to continue
          </Alert>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Edit Mode: Input Fields */}
          {showEditMode && dataToDisplay ? (
            <>
              <TextField
                label='First Name'
                value={dataToDisplay.firstName}
                onChange={handleChange('firstName')}
                required
                fullWidth
                size='small'
                disabled={saving}
              />
              <TextField
                label='Last Name'
                value={dataToDisplay.lastName}
                onChange={handleChange('lastName')}
                required
                fullWidth
                size='small'
                disabled={saving}
              />
              <TextField
                label='Phone Number'
                value={dataToDisplay.phoneNumber}
                onChange={handleChange('phoneNumber')}
                fullWidth
                size='small'
                disabled={saving}
                placeholder='(optional)'
              />
              <TextField
                label='Email'
                value={dataToDisplay.email}
                disabled
                fullWidth
                size='small'
                helperText='Email cannot be changed'
              />

              {/* Save/Cancel Buttons */}
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Button
                  variant='contained'
                  onClick={handleSave}
                  disabled={saving}
                  fullWidth
                >
                  {saving ? 'Saving...' : 'Save'}
                </Button>
                {!isIncomplete && (
                  <Button
                    variant='outlined'
                    onClick={handleCancel}
                    disabled={saving}
                    fullWidth
                  >
                    Cancel
                  </Button>
                )}
              </Box>
            </>
          ) : (
            /* Display Mode: Read-only */
            <>
              {/* Name */}
              {(profileData.firstName || profileData.lastName) && (
                <>
                  <Box>
                    <Typography variant='body2' color='text.secondary'>
                      Name
                    </Typography>
                    <Typography variant='body1'>
                      {profileData.firstName} {profileData.lastName}
                    </Typography>
                  </Box>
                  <Divider />
                </>
              )}

              {/* Phone Number */}
              {profileData.phoneNumber && (
                <>
                  <Box>
                    <Typography variant='body2' color='text.secondary'>
                      Phone Number
                    </Typography>
                    <Typography variant='body1'>{profileData.phoneNumber}</Typography>
                  </Box>
                  <Divider />
                </>
              )}

              {/* Email */}
              <Box>
                <Typography variant='body2' color='text.secondary'>
                  Email
                </Typography>
                <Typography variant='body1'>{profileData.email}</Typography>
                <Typography variant='caption' color='text.secondary'>
                  Confirmation will be sent to this email
                </Typography>
              </Box>

              {/* Edit Button */}
              <Button
                variant='outlined'
                onClick={handleEdit}
                sx={{ mt: 1 }}
                size='small'
              >
                Edit Information
              </Button>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default GuestInfoCard;
