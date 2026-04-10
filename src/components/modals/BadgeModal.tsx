'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Palette, Star, Plus, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface BadgeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateBadge?: (badge: BadgeData) => void;
}

export interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: 'achievement' | 'streak' | 'special' | 'milestone';
  requirement: string;
  points: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

const iconOptions = ['🏆', '🥇', '⭐', '🔥', '💎', '🎯', '🚀', '💪', '🌟', '🏅', '🎖️', '👑', '🎉', '✨', '💫', '🔔', '📚', '💻', '🔬', '🎨'];

const colorOptions = [
  { value: '#10B981', label: 'Emerald', class: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  { value: '#3B82F6', label: 'Blue', class: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  { value: '#F59E0B', label: 'Amber', class: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  { value: '#EF4444', label: 'Red', class: 'bg-red-500/10 text-red-500 border-red-500/20' },
  { value: '#8B5CF6', label: 'Purple', class: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  { value: '#EC4899', label: 'Pink', class: 'bg-pink-500/10 text-pink-500 border-pink-500/20' },
  { value: '#06B6D4', label: 'Cyan', class: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' },
  { value: '#F97316', label: 'Orange', class: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
];

const categories = [
  { value: 'achievement', label: 'Achievement', description: 'For completing specific tasks' },
  { value: 'streak', label: 'Streak', description: 'For consistent activity' },
  { value: 'milestone', label: 'Milestone', description: 'For reaching major goals' },
  { value: 'special', label: 'Special', description: 'Limited edition or event badges' },
];

const rarities = [
  { value: 'common', label: 'Common', color: 'text-gray-500', bg: 'bg-gray-500/10' },
  { value: 'uncommon', label: 'Uncommon', color: 'text-green-500', bg: 'bg-green-500/10' },
  { value: 'rare', label: 'Rare', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { value: 'epic', label: 'Epic', color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { value: 'legendary', label: 'Legendary', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
];

const existingBadges = [
  { id: '1', name: 'First Step', icon: '🎯', color: '#10B981', earned: 245 },
  { id: '2', name: 'Week Warrior', icon: '🔥', color: '#F59E0B', earned: 128 },
  { id: '3', name: 'Deadline Destroyer', icon: '💀', color: '#EF4444', earned: 67 },
  { id: '4', name: 'Early Bird', icon: '🌅', color: '#8B5CF6', earned: 189 },
];

export function BadgeModal({ open, onOpenChange, onCreateBadge }: BadgeModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('🏆');
  const [color, setColor] = useState('#10B981');
  const [category, setCategory] = useState<BadgeData['category']>('achievement');
  const [requirement, setRequirement] = useState('');
  const [points, setPoints] = useState('100');
  const [rarity, setRarity] = useState<BadgeData['rarity']>('common');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const badgeData: BadgeData = {
      id: Date.now().toString(),
      name: name.trim(),
      description: description.trim(),
      icon,
      color,
      category,
      requirement: requirement.trim(),
      points: parseInt(points) || 100,
      rarity,
    };

    if (onCreateBadge) {
      onCreateBadge(badgeData);
    }

    // Reset form
    setName('');
    setDescription('');
    setIcon('🏆');
    setColor('#10B981');
    setRequirement('');
    setPoints('100');
    
    // Close the modal
    onOpenChange(false);
    
    console.log('Creating badge:', badgeData);
  };

  const selectedColorOption = colorOptions.find(c => c.value === color);
  const selectedRarity = rarities.find(r => r.value === rarity);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Create Badge
          </DialogTitle>
          <DialogDescription>
            Design a new achievement badge for users to earn
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Badge Preview */}
          <div className="p-6 rounded-lg bg-muted/30 text-center">
            <motion.div
              key={`${icon}-${color}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex flex-col items-center gap-2"
            >
              <div 
                className={cn(
                  'w-20 h-20 rounded-full flex items-center justify-center text-4xl border-2',
                  selectedColorOption?.class
                )}
                style={{ backgroundColor: color + '20', borderColor: color }}
              >
                {icon}
              </div>
              <p className="font-semibold">{name || 'Badge Name'}</p>
              <Badge className={cn(selectedRarity?.bg, selectedRarity?.color)}>
                {selectedRarity?.label}
              </Badge>
            </motion.div>
          </div>

          {/* Create Badge Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Badge Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Badge Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Task Master"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* Points */}
              <div className="space-y-2">
                <Label htmlFor="points">Points Value</Label>
                <Input
                  id="points"
                  type="number"
                  min="10"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What does this badge represent?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            {/* Icon Selector */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Badge Icon
              </Label>
              <div className="flex flex-wrap gap-2 p-3 rounded-lg border">
                {iconOptions.map((i) => (
                  <motion.button
                    key={i}
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIcon(i)}
                    className={cn(
                      'w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-colors',
                      icon === i 
                        ? 'bg-primary/20 ring-2 ring-primary' 
                        : 'hover:bg-muted'
                    )}
                  >
                    {i}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Color Selector */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Badge Color
              </Label>
              <div className="flex gap-2 flex-wrap">
                {colorOptions.map((c) => (
                  <motion.button
                    key={c.value}
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setColor(c.value)}
                    className={cn(
                      'w-8 h-8 rounded-full transition-all',
                      color === c.value ? 'ring-2 ring-offset-2 ring-foreground' : ''
                    )}
                    style={{ backgroundColor: c.value }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Category */}
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={(v: BadgeData['category']) => setCategory(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        <div className="flex flex-col">
                          <span>{c.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Rarity */}
              <div className="space-y-2">
                <Label>Rarity</Label>
                <Select value={rarity} onValueChange={(v: BadgeData['rarity']) => setRarity(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select rarity" />
                  </SelectTrigger>
                  <SelectContent>
                    {rarities.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        <span className={r.color}>{r.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Requirement */}
            <div className="space-y-2">
              <Label htmlFor="requirement">How to Earn</Label>
              <Input
                id="requirement"
                placeholder="e.g., Complete 100 tasks"
                value={requirement}
                onChange={(e) => setRequirement(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!name.trim()}>
                <Sparkles className="h-4 w-4 mr-2" />
                Create Badge
              </Button>
            </div>
          </form>

          {/* Existing Badges */}
          <div className="space-y-3 pt-4 border-t">
            <Label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Award className="h-4 w-4" />
              Existing Badges
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {existingBadges.map((badge) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
                >
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                    style={{ backgroundColor: badge.color + '20' }}
                  >
                    {badge.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{badge.name}</p>
                    <p className="text-xs text-muted-foreground">{badge.earned} earned</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
