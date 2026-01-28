"""
Journey Graph CSV Processor

このスクリプトは、Journey GraphのCSVデータを読み込み、
ユーザージャーニーを辿るための処理を行います。
"""

import csv
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum


class IntentCode(Enum):
    """ユーザー意図コード"""
    I1 = "今すぐ使いたい"
    I2 = "原因を知りたい"
    I3 = "自分で直したい"
    I4 = "壊したくない・安全優先"
    I5 = "誰かに頼みたい"
    I6 = "後で対応したい"


@dataclass
class Theme:
    """テーマ"""
    theme_id: str
    theme_name: str
    description: str
    urgency_level: str
    primary_intents: List[str]
    notes: str


@dataclass
class JourneyNode:
    """ジャーニーノード"""
    node_id: str
    theme_id: str
    phase: str
    state_description: str
    trigger: str
    hypotheses: List[str]
    confidence_level: float
    notes: str


@dataclass
class CheckCondition:
    """判定条件"""
    check_id: str
    node_id: str
    question: str
    answer_type: str
    answers: List[str]
    supports: List[str]
    notes: str


@dataclass
class Edge:
    """分岐（エッジ）"""
    edge_id: str
    from_node_id: str
    condition: str
    condition_value: str
    to_type: str
    to_id: str
    priority: int


@dataclass
class Guide:
    """ガイドコンテンツ"""
    guide_id: str
    guide_type: str
    title: str
    estimated_time: str
    risk_level: str
    notes: str


@dataclass
class NodeIntent:
    """ノード×意図マッピング"""
    node_id: str
    primary_intent: str
    secondary_intent: str
    confidence: float
    notes: str


@dataclass
class IntentAction:
    """意図別アクション"""
    intent_code: str
    action_type: str
    action_id: str
    priority: int
    notes: str


@dataclass
class ContextData:
    """L2文脈データ"""
    time_of_day: str  # "morning", "afternoon", "evening", "night"
    location: str  # "home", "remote", "highway", etc.
    user_skill_level: str  # "beginner", "intermediate", "advanced"
    past_experience: Dict[str, bool]  # {"battery_replace": True, ...}
    weather: Optional[str] = None
    vehicle_battery_voltage: Optional[float] = None


class JourneyGraphProcessor:
    """Journey Graph処理クラス"""
    
    def __init__(self, csv_dir: str):
        """
        Args:
            csv_dir: CSVファイルが格納されているディレクトリパス
        """
        self.csv_dir = csv_dir
        self.themes: Dict[str, Theme] = {}
        self.nodes: Dict[str, JourneyNode] = {}
        self.checks: Dict[str, CheckCondition] = {}
        self.edges: List[Edge] = []
        self.guides: Dict[str, Guide] = {}
        self.node_intents: Dict[str, NodeIntent] = {}
        self.intent_actions: Dict[str, List[IntentAction]] = {}
        
        self._load_all_data()
    
    def _load_all_data(self):
        """すべてのCSVデータを読み込む"""
        self._load_themes()
        self._load_nodes()
        self._load_checks()
        self._load_edges()
        self._load_guides()
        self._load_node_intents()
        self._load_intent_actions()
    
    def _load_themes(self):
        """Theme.csvを読み込む"""
        with open(f"{self.csv_dir}/Theme.csv", "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                theme = Theme(
                    theme_id=row["theme_id"],
                    theme_name=row["theme_name"],
                    description=row["description"],
                    urgency_level=row["urgency_level"],
                    primary_intents=row["primary_intents"].split("|"),
                    notes=row["notes"]
                )
                self.themes[theme.theme_id] = theme
    
    def _load_nodes(self):
        """JourneyNode.csvを読み込む"""
        with open(f"{self.csv_dir}/JourneyNode.csv", "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                node = JourneyNode(
                    node_id=row["node_id"],
                    theme_id=row["theme_id"],
                    phase=row["phase"],
                    state_description=row["state_description"],
                    trigger=row["trigger"],
                    hypotheses=row["hypotheses"].split("|"),
                    confidence_level=float(row["confidence_level"]),
                    notes=row["notes"]
                )
                self.nodes[node.node_id] = node
    
    def _load_checks(self):
        """CheckCondition.csvを読み込む"""
        with open(f"{self.csv_dir}/CheckCondition.csv", "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                check = CheckCondition(
                    check_id=row["check_id"],
                    node_id=row["node_id"],
                    question=row["question"],
                    answer_type=row["answer_type"],
                    answers=row["answers"].split("|"),
                    supports=row["supports"].split("|"),
                    notes=row["notes"]
                )
                self.checks[check.check_id] = check
    
    def _load_edges(self):
        """Edge.csvを読み込む"""
        with open(f"{self.csv_dir}/Edge.csv", "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                edge = Edge(
                    edge_id=row["edge_id"],
                    from_node_id=row["from_node_id"],
                    condition=row["condition"],
                    condition_value=row["condition_value"],
                    to_type=row["to_type"],
                    to_id=row["to_id"],
                    priority=int(row["priority"])
                )
                self.edges.append(edge)
    
    def _load_guides(self):
        """Guide.csvを読み込む"""
        with open(f"{self.csv_dir}/Guide.csv", "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                guide = Guide(
                    guide_id=row["guide_id"],
                    guide_type=row["guide_type"],
                    title=row["title"],
                    estimated_time=row["estimated_time"],
                    risk_level=row["risk_level"],
                    notes=row["notes"]
                )
                self.guides[guide.guide_id] = guide
    
    def _load_node_intents(self):
        """NodeIntent.csvを読み込む"""
        with open(f"{self.csv_dir}/NodeIntent.csv", "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                node_intent = NodeIntent(
                    node_id=row["node_id"],
                    primary_intent=row["primary_intent"],
                    secondary_intent=row["secondary_intent"],
                    confidence=float(row["confidence"]),
                    notes=row["notes"]
                )
                self.node_intents[node_intent.node_id] = node_intent
    
    def _load_intent_actions(self):
        """IntentAction.csvを読み込む"""
        with open(f"{self.csv_dir}/IntentAction.csv", "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                action = IntentAction(
                    intent_code=row["intent_code"],
                    action_type=row["action_type"],
                    action_id=row["action_id"],
                    priority=int(row["priority"]),
                    notes=row["notes"]
                )
                if action.intent_code not in self.intent_actions:
                    self.intent_actions[action.intent_code] = []
                self.intent_actions[action.intent_code].append(action)
    
    def get_initial_node(self, theme_id: str) -> Optional[JourneyNode]:
        """テーマの初期ノードを取得"""
        for node in self.nodes.values():
            if node.theme_id == theme_id and node.phase == "異常検知":
                return node
        return None
    
    def get_check_for_node(self, node_id: str) -> Optional[CheckCondition]:
        """ノードに対応する判定条件を取得"""
        for check in self.checks.values():
            if check.node_id == node_id:
                return check
        return None
    
    def get_next_node(self, current_node_id: str, condition_value: Optional[str] = None) -> Optional[str]:
        """次のノードまたはガイドを取得"""
        matching_edges = [
            edge for edge in self.edges
            if edge.from_node_id == current_node_id
        ]
        
        if condition_value:
            # 条件値に一致するエッジを探す
            for edge in matching_edges:
                if edge.condition_value == condition_value:
                    return edge.to_id if edge.to_type == "node" else None
        
        # 条件値がない場合は優先度が最も高いエッジを返す
        if matching_edges:
            matching_edges.sort(key=lambda e: e.priority)
            return matching_edges[0].to_id if matching_edges[0].to_type == "node" else None
        
        return None
    
    def get_guide_for_node(self, node_id: str, condition_value: Optional[str] = None) -> Optional[Guide]:
        """ノードに対応するガイドを取得"""
        matching_edges = [
            edge for edge in self.edges
            if edge.from_node_id == node_id and edge.to_type == "guide"
        ]
        
        if condition_value:
            for edge in matching_edges:
                if edge.condition_value == condition_value:
                    return self.guides.get(edge.to_id)
        
        if matching_edges:
            matching_edges.sort(key=lambda e: e.priority)
            return self.guides.get(matching_edges[0].to_id)
        
        return None
    
    def estimate_intent(self, node_id: str, context: ContextData) -> Tuple[str, str, Dict[str, float]]:
        """
        L2文脈データを使ってユーザー意図を推測
        
        Returns:
            (primary_intent, secondary_intent, scores)
        """
        node_intent = self.node_intents.get(node_id)
        if not node_intent:
            return ("I1", "I2", {})
        
        # 基本スコア
        scores = {
            node_intent.primary_intent: 100,
            node_intent.secondary_intent: 80
        }
        
        # 文脈データによる調整
        primary = node_intent.primary_intent
        secondary = node_intent.secondary_intent
        
        # 時刻による調整
        if context.time_of_day == "night":
            if primary == "I1":
                scores[primary] += 30
            if secondary == "I1":
                scores[secondary] += 30
        
        # 場所による調整
        if context.location == "remote":
            if primary == "I3":
                scores[primary] += 20
            if secondary == "I3":
                scores[secondary] += 20
        
        # スキルレベルによる調整
        if context.user_skill_level == "beginner":
            if primary == "I1":
                scores[primary] += 20
            if secondary == "I1":
                scores[secondary] += 20
        elif context.user_skill_level == "advanced":
            if primary == "I3":
                scores[primary] += 20
            if secondary == "I3":
                scores[secondary] += 20
        
        # 過去の経験による調整
        if context.past_experience.get("battery_replace"):
            if primary == "I3":
                scores[primary] += 20
            if secondary == "I3":
                scores[secondary] += 20
        
        # スコアでソート
        sorted_intents = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        
        return (sorted_intents[0][0], sorted_intents[1][0], scores)
    
    def get_recommended_actions(self, intent_code: str) -> List[IntentAction]:
        """意図に対応する推奨アクションを取得"""
        actions = self.intent_actions.get(intent_code, [])
        return sorted(actions, key=lambda a: a.priority)
    
    def traverse_journey(self, theme_id: str, user_answers: Dict[str, str], context: ContextData) -> List[Dict]:
        """
        ジャーニーを辿る
        
        Args:
            theme_id: テーマID
            user_answers: ユーザーの回答 {check_id: answer_value}
            context: L2文脈データ
        
        Returns:
            ジャーニーパス（ノードとガイドのリスト）
        """
        journey_path = []
        
        # 初期ノードを取得
        current_node = self.get_initial_node(theme_id)
        if not current_node:
            return journey_path
        
        # ジャーニーを辿る
        while current_node:
            # 意図推測
            primary_intent, secondary_intent, scores = self.estimate_intent(
                current_node.node_id, context
            )
            
            # ノード情報を記録
            journey_path.append({
                "type": "node",
                "node_id": current_node.node_id,
                "state": current_node.state_description,
                "phase": current_node.phase,
                "estimated_intent": {
                    "primary": primary_intent,
                    "secondary": secondary_intent,
                    "scores": scores
                }
            })
            
            # 判定条件を取得
            check = self.get_check_for_node(current_node.node_id)
            if check:
                # ユーザーの回答を取得
                answer = user_answers.get(check.check_id)
                if answer:
                    journey_path.append({
                        "type": "check",
                        "check_id": check.check_id,
                        "question": check.question,
                        "answer": answer
                    })
                    
                    # 次のノードを取得
                    next_node_id = self.get_next_node(current_node.node_id, answer)
                    if next_node_id:
                        current_node = self.nodes.get(next_node_id)
                        continue
            
            # ガイドを取得
            guide = self.get_guide_for_node(current_node.node_id)
            if guide:
                journey_path.append({
                    "type": "guide",
                    "guide_id": guide.guide_id,
                    "title": guide.title,
                    "guide_type": guide.guide_type,
                    "estimated_time": guide.estimated_time,
                    "risk_level": guide.risk_level
                })
            
            # ジャーニー終了
            break
        
        return journey_path


# 使用例
if __name__ == "__main__":
    # CSVデータを読み込む
    processor = JourneyGraphProcessor("./")
    
    # 文脈データを設定
    context = ContextData(
        time_of_day="night",
        location="remote",
        user_skill_level="beginner",
        past_experience={}
    )
    
    # ユーザーの回答を設定
    user_answers = {
        "CHECK-001A": "no",  # インジケーター点灯しない
        "CHECK-001B": "immediate"  # すぐに開錠したい
    }
    
    # ジャーニーを辿る
    journey_path = processor.traverse_journey("THEME-001", user_answers, context)
    
    # 結果を表示
    print("=== Journey Path ===")
    for step in journey_path:
        if step["type"] == "node":
            print(f"\n[NODE] {step['node_id']}")
            print(f"  State: {step['state']}")
            print(f"  Phase: {step['phase']}")
            print(f"  Primary Intent: {step['estimated_intent']['primary']}")
            print(f"  Secondary Intent: {step['estimated_intent']['secondary']}")
            print(f"  Scores: {step['estimated_intent']['scores']}")
        elif step["type"] == "check":
            print(f"\n[CHECK] {step['check_id']}")
            print(f"  Question: {step['question']}")
            print(f"  Answer: {step['answer']}")
        elif step["type"] == "guide":
            print(f"\n[GUIDE] {step['guide_id']}")
            print(f"  Title: {step['title']}")
            print(f"  Type: {step['guide_type']}")
            print(f"  Time: {step['estimated_time']}")
            print(f"  Risk: {step['risk_level']}")
