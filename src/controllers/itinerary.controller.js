import supabase from "../config/supabase.js";

const verifyTripOwner = async (tripId, userId) => {
  const { data } = await supabase
    .from("trips")
    .select("user_id")
    .eq("id", tripId)
    .single();
  return data && data.user_id === userId;
};

export const getItinerary = async (req, res) => {
  try {
    const owned = await verifyTripOwner(req.params.tripId, req.user.id);
    if (!owned) return res.status(403).json({ error: "Access denied" });

    const { data, error } = await supabase
      .from("itinerary_items")
      .select("*")
      .eq("trip_id", req.params.tripId)
      .order("day_number", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) throw error;
    res.json({ items: data });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch itinerary" });
  }
};

export const addItem = async (req, res) => {
  try {
    const owned = await verifyTripOwner(req.params.tripId, req.user.id);
    if (!owned) return res.status(403).json({ error: "Access denied" });

    const {
      day_number,
      type,
      title,
      description,
      location,
      address,
      latitude,
      longitude,
      start_time,
      end_time,
      confirmation_number,
      cost,
      currency,
      status,
      notes,
    } = req.body;

    const { data, error } = await supabase
      .from("itinerary_items")
      .insert([
        {
          trip_id: req.params.tripId,
          day_number,
          type,
          title,
          description,
          location,
          address,
          latitude,
          longitude,
          start_time,
          end_time,
          confirmation_number,
          cost,
          currency: currency || "USD",
          status: status || "planned",
          notes,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ item: data });
  } catch (err) {
    res.status(500).json({ error: "Failed to add itinerary item" });
  }
};

export const updateItem = async (req, res) => {
  try {
    const { data: item } = await supabase
      .from("itinerary_items")
      .select("trip_id")
      .eq("id", req.params.id)
      .single();
    if (!item) return res.status(404).json({ error: "Item not found" });

    const owned = await verifyTripOwner(item.trip_id, req.user.id);
    if (!owned) return res.status(403).json({ error: "Access denied" });

    const { data, error } = await supabase
      .from("itinerary_items")
      .update(req.body)
      .eq("id", req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ item: data });
  } catch (err) {
    res.status(500).json({ error: "Failed to update item" });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const { data: item } = await supabase
      .from("itinerary_items")
      .select("trip_id")
      .eq("id", req.params.id)
      .single();
    if (!item) return res.status(404).json({ error: "Item not found" });
    const owned = await verifyTripOwner(item.trip_id, req.user.id);
    if (!owned) return res.status(403).json({ error: "Access denied" });
    await supabase.from("itinerary_items").delete().eq("id", req.params.id);
    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete item" });
  }
};
