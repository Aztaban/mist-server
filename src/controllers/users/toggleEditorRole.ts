import { Request, Response } from "express";
import { toggleEditorRoleService } from "../../services/userServices";
import { ROLES_LIST } from "../../config/roles_list";

export const toggleEditorRole = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'Invalid ID' });
  }

  try {
    const user = await toggleEditorRoleService(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};