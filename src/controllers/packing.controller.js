import supabase from "../config/supabase.js";

const verifyTripOwner = async (tripId, userId) => {
  const { data } = await supabase
    .from("trips")
    .select("user_id")
    .eq("id", tripId)
    .single();
  return data && data.user_id === userId;
};

export const getPacking = async (req, res) => {
  try {
    const owned = await verifyTripOwner(req.params.tripId, req.user.id);
    if (!owned) return res.status(403).json({ error: "Access denied" });
    const { data, error } = await supabase
      .from("packing_lists")
      .select("*")
      .eq("trip_id", req.params.tripId)
      .order("category");
    if (error) throw error;
    res.json({ items: data });
  } catch {
    res.status(500).json({ error: "Failed to fetch packing list" });
  }
};

export const addPackingItem = async (req, res) => {
  try {
    const owned = await verifyTripOwner(req.params.tripId, req.user.id);
    if (!owned) return res.status(403).json({ error: "Access denied" });
    const { item_name, category, quantity, notes } = req.body;
    const { data, error } = await supabase
      .from("packing_lists")
      .insert([
        {
          trip_id: req.params.tripId,
          item_name,
          category,
          quantity: quantity || 1,
          notes,
        },
      ])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ item: data });
  } catch {
    res.status(500).json({ error: "Failed to add packing item" });
  }
};

export const togglePackingItem = async (req, res) => {
  try {
    const { data: item } = await supabase
      .from("packing_lists")
      .select("trip_id, is_packed")
      .eq("id", req.params.id)
      .single();
    if (!item) return res.status(404).json({ error: "Item not found" });
    const owned = await verifyTripOwner(item.trip_id, req.user.id);
    if (!owned) return res.status(403).json({ error: "Access denied" });
    const { data, error } = await supabase
      .from("packing_lists")
      .update({ is_packed: !item.is_packed })
      .eq("id", req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ item: data });
  } catch {
    res.status(500).json({ error: "Failed to toggle packing item" });
  }
};

export const deletePackingItem = async (req, res) => {
  try {
    const { data: item } = await supabase
      .from("packing_lists")
      .select("trip_id")
      .eq("id", req.params.id)
      .single();
    if (!item) return res.status(404).json({ error: "Not found" });
    const owned = await verifyTripOwner(item.trip_id, req.user.id);
    if (!owned) return res.status(403).json({ error: "Access denied" });
    await supabase.from("packing_lists").delete().eq("id", req.params.id);
    res.json({ message: "Item deleted" });
  } catch {
    res.status(500).json({ error: "Failed to delete packing item" });
  }
};
