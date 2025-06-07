# ml-service/model_definition.py
import torch
import torch.nn as nn

# This class defines the custom "head" of our Vision Transformer.
# It must be identical to the one used during training.
class IrrigationViTHead(nn.Module):
    def __init__(self, in_features, out_features=14):
        super().__init__()
        self.schedule_predictor = nn.Linear(in_features, out_features)
        self.quantity_predictor = nn.Linear(in_features, out_features)

    def forward(self, x):
        # Apply sigmoid to schedule logits to get a 0-1 probability
        # Apply ReLU to quantity to ensure it's not negative
        return torch.sigmoid(self.schedule_predictor(x)), torch.relu(self.quantity_predictor(x))