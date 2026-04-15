import { Avatar } from "@/components/ui";
import React from "react";
import { Text, View } from "react-native";

const COMMUNITY_MEMBERS = [
  { id: "1", src: "https://randomuser.me/api/portraits/women/31.jpg" },
  { id: "2", src: "https://randomuser.me/api/portraits/men/32.jpg" },
  { id: "3", src: "https://randomuser.me/api/portraits/women/68.jpg" },
  { id: "4", src: "https://randomuser.me/api/portraits/women/45.jpg" },
  { id: "5", src: "https://randomuser.me/api/portraits/women/55.jpg" },
  { id: "6", src: "https://randomuser.me/api/portraits/men/75.jpg" },
  { id: "7", src: "https://randomuser.me/api/portraits/women/63.jpg" },
];

/**
 * Stacked avatar cluster perfectly aligned horizontally.
 * All 7 avatars are in the same line stacked outward.
 */
const AVATAR_POSITIONS: Array<{
  idx: number;
  size: number;
  x: number;
  y: number;
  z: number;
}> = [
  { idx: 0, size: 34, x: 0, y: 17, z: 1 },
  { idx: 1, size: 44, x: 22, y: 12, z: 2 },
  { idx: 2, size: 56, x: 50, y: 6, z: 3 },
  { idx: 3, size: 68, x: 92, y: 0, z: 4 },
  { idx: 4, size: 56, x: 146, y: 6, z: 3 },
  { idx: 5, size: 44, x: 186, y: 12, z: 2 },
  { idx: 6, size: 34, x: 218, y: 17, z: 1 },
];

const LAYOUT_WIDTH = 252;
const LAYOUT_HEIGHT = 68;
const GROUP_HEIGHT = 116;

function CommunityAvatarGroup(): React.JSX.Element {
  return (
    <View className="items-center justify-start pt-8" style={{ height: GROUP_HEIGHT }}>
      <View style={{ width: LAYOUT_WIDTH, height: LAYOUT_HEIGHT }}>
        {AVATAR_POSITIONS.map((pos) => {
          const member = COMMUNITY_MEMBERS[pos.idx];
          return (
            <View
              key={member.id}
              style={{
                position: "absolute",
                left: pos.x,
                top: pos.y,
                zIndex: pos.z,
              }}
            >
              <Avatar
                alt={`Community member ${pos.idx + 1}`}
                animation="disable-all"
                className="rounded-full"
                variant="default"
                style={{
                  width: pos.size,
                  height: pos.size,
                }}
              >
                <Avatar.Image source={{ uri: member.src }} animation={false} />
                <Avatar.Fallback animation="disabled" delayMs={180}>
                  {`M${pos.idx + 1}`}
                </Avatar.Fallback>
              </Avatar>
            </View>
          );
        })}
      </View>
      <View className="mt-4">
        <Text className="text-xs font-medium tracking-wide text-white/40 leading-3">
          Jogue com +200 alunos
        </Text>
      </View>
    </View>
  );
}

export { CommunityAvatarGroup };
