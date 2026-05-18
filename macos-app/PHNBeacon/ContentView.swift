import SwiftUI

struct ContentView: View {
    var body: some View {
        NavigationSplitView {
            List {
                Label("Overview", systemImage: "antenna.radiowaves.left.and.right")
                Label("Economy", systemImage: "chart.line.uptrend.xyaxis")
                Label("About", systemImage: "info.circle")
            }
        } detail: {
            VStack(alignment: .leading, spacing: 18) {
                Text("PHN Beacon")
                    .font(.largeTitle.bold())
                Text("Verified machines earn. Humans remain accountable.")
                    .foregroundStyle(.secondary)
                GroupBox("Economy") {
                    VStack(alignment: .leading, spacing: 10) {
                        Text("Prelaunch: 0.2 PEAQ / PHN")
                        Text("Public price: 0.6 PEAQ / PHN")
                        Text("Fee: 1% • Burn: 25% • Owner treasury: 75%")
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                }
                Spacer()
            }
            .padding(24)
        }
    }
}
