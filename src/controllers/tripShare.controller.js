import supabase from "../config/supabase.js";

const verifyTripOwner = async (tripId, userId) => {
  const { data } = await supabase
    .from("trips")
    .select("user_id")
    .eq("id", tripId)
    .single();
  return data && data.user_id === userId;
};

export const shareTrip = async (req, res) => {
  try {
    const owned = await verifyTripOwner(req.params.tripId, req.user.id);
    if (!owned) return res.status(403).json({ error: "Access denied" });
    const { shared_with_email, permission } = req.body;
    const { data, error } = await supabase
      .from("trip_shares")
      .upsert(
        [
          {
            trip_id: req.params.tripId,
            shared_by: req.user.id,
            shared_with_email,
            permission: permission || "view",
          },
        ],
        { onConflict: "trip_id,shared_with_email" },
      )
      .select()
      .single();
    if (error) throw error;
    await supabase
      .from("trips")
      .update({ is_shared: true })
      .eq("id", req.params.tripId);
    res.status(201).json({ share: data });
  } catch {
    res.status(500).json({ error: "Failed to share trip" });
  }
};

export const getShares = async (req, res) => {
  try {
    const owned = await verifyTripOwner(req.params.tripId, req.user.id);
    if (!owned) return res.status(403).json({ error: "Access denied" });
    const { data, error } = await supabase
      .from("trip_shares")
      .select("*")
      .eq("trip_id", req.params.tripId);
    if (error) throw error;
    res.json({ shares: data });
  } catch {
    res.status(500).json({ error: "Failed to fetch shares" });
  }
};

export const removeShare = async (req, res) => {
  try {
    await supabase.from("trip_shares").delete().eq("id", req.params.id);
    res.json({ message: "Share removed" });
  } catch {
    res.status(500).json({ error: "Failed to remove share" });
  }
};
