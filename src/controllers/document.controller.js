import supabase from "../config/supabase.js";

const verifyTripOwner = async (tripId, userId) => {
  const { data } = await supabase
    .from("trips")
    .select("user_id")
    .eq("id", tripId)
    .single();
  return data && data.user_id === userId;
};

export const getDocuments = async (req, res) => {
  try {
    const owned = await verifyTripOwner(req.params.tripId, req.user.id);
    if (!owned) return res.status(403).json({ error: "Access denied" });
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("trip_id", req.params.tripId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json({ documents: data });
  } catch {
    res.status(500).json({ error: "Failed to fetch documents" });
  }
};

export const addDocument = async (req, res) => {
  try {
    const owned = await verifyTripOwner(req.params.tripId, req.user.id);
    if (!owned) return res.status(403).json({ error: "Access denied" });
    const { type, name, file_url, file_size, expiry_date, notes } = req.body;
    const { data, error } = await supabase
      .from("documents")
      .insert([
        {
          trip_id: req.params.tripId,
          user_id: req.user.id,
          type,
          name,
          file_url,
          file_size,
          expiry_date,
          notes,
        },
      ])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ document: data });
  } catch {
    res.status(500).json({ error: "Failed to add document" });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { data: doc } = await supabase
      .from("documents")
      .select("user_id")
      .eq("id", req.params.id)
      .single();
    if (!doc || doc.user_id !== req.user.id)
      return res.status(403).json({ error: "Access denied" });
    await supabase.from("documents").delete().eq("id", req.params.id);
    res.json({ message: "Document deleted" });
  } catch {
    res.status(500).json({ error: "Failed to delete document" });
  }
};
