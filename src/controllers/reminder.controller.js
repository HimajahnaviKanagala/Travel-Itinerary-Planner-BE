import supabase from "../config/supabase.js";

const verifyTripOwner = async (tripId, userId) => {
  const { data } = await supabase
    .from("trips")
    .select("user_id")
    .eq("id", tripId)
    .single();
  return data && data.user_id === userId;
};

export const getReminders = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("reminders")
      .select("*")
      .eq("trip_id", req.params.tripId)
      .eq("user_id", req.user.id)
      .order("reminder_time");
    if (error) throw error;
    res.json({ reminders: data });
  } catch {
    res.status(500).json({ error: "Failed to fetch reminders" });
  }
};

export const addReminder = async (req, res) => {
  try {
    const owned = await verifyTripOwner(req.params.tripId, req.user.id);
    if (!owned) return res.status(403).json({ error: "Access denied" });
    const { type, title, description, reminder_time } = req.body;
    const { data, error } = await supabase
      .from("reminders")
      .insert([
        {
          trip_id: req.params.tripId,
          user_id: req.user.id,
          type,
          title,
          description,
          reminder_time,
        },
      ])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ reminder: data });
  } catch {
    res.status(500).json({ error: "Failed to add reminder" });
  }
};

export const deleteReminder = async (req, res) => {
  try {
    const { data: rem } = await supabase
      .from("reminders")
      .select("user_id")
      .eq("id", req.params.id)
      .single();
    if (!rem || rem.user_id !== req.user.id)
      return res.status(403).json({ error: "Access denied" });
    await supabase.from("reminders").delete().eq("id", req.params.id);
    res.json({ message: "Reminder deleted" });
  } catch {
    res.status(500).json({ error: "Failed to delete reminder" });
  }
};
